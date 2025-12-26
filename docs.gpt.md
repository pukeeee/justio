CRM SaaS Product Documentation

1. Product Vision

Our product is a SaaS CRM platform tailored for small and medium businesses (SMBs) in Ukraine, with plans to internationalize. It centralizes customer and order management in an easy-to-use web application (mobile-first design) that works offline as a PWA. The CRM will streamline daily workflows (tracking leads, managing sales/orders, customer contacts) and integrate local services (e.g. Nova Poshta shipping). The vision is to start as a simple B2B CRM for single businesses, then evolve into a B2B2B network where suppliers can also join the platform to share product catalogs and receive orders from client businesses. This future marketplace ecosystem will allow an entrepreneur to not only manage their customers but also view supplier inventories and place restock orders within the same system.

Key characteristics of the vision include:
	•	Focus on SMB Needs: Provide core CRM functions (contact management, order tracking) without the bloat. Emphasize ease of use, quick setup, and minimal technical skill required.
	•	Local Optimization: Out-of-the-box integration with Ukrainian services (Nova Poshta for delivery, local SMS/email gateways) and Ukrainian language UI (with internationalization support for future expansion).
	•	Mobile and Offline First: Enable on-the-go usage via mobile-friendly design and offline capabilities. Users (e.g. store owners on the move) can access customer info and even create orders without internet, then sync when reconnected.
	•	Scalable & Modular Platform: Architect the system as a modular monolith initially – one codebase with clear domain modules (customers, orders, auth, etc.) – allowing rapid iteration ￼. As the product grows, the architecture will adapt without major rewrites ￼. Future modules (inventory, analytics, supplier portal, third-party plugins) can be added as separate feature modules. We also plan an open API and module marketplace to let third-party developers extend the CRM’s functionality in the long run.
	•	Monetization Built-In: Designed for a subscription model from day one – offering tiered plans and paid add-ons – to ensure the product is commercially sustainable once it gains users.

(Engineering assumption: We assume a starting brand name “CRM4SMB” for reference in this documentation, and that initial target users are Ukrainian retail/service businesses with 1-10 employees. The product should be usable immediately for these users’ basic needs, and gradually evolve more advanced features as demand dictates.)*

2. User Roles & Permissions

We implement a role-based access control system to manage what different users can do. Every user account is tied to an organization (tenant) to enable multi-tenancy. The core roles and their permissions are:
	•	Organization Owner/Admin: Usually the business owner. Full permissions within their organization. Can manage all data (customers, orders, products, etc.), invite or remove team members, configure integrations (e.g. set API keys for SMS or Nova Poshta), and manage billing/subscription for their org.
	•	Manager/Staff User: A regular team member of the organization. Can view and modify customer records and orders, but with some restrictions. For example, they might create and update orders, but not delete customers (depending on internal policy settings). They cannot manage subscription or delete the entire organization. (Admins can configure fine-grained rights for managers in future, e.g. sales vs support roles.)
	•	Read-Only User (optional): (Planned as an option) A user who can view data but not modify it. Useful for an accountant or an external auditor. This role can browse customers, orders, and reports but cannot create or edit entries.
	•	Supplier User (future B2B2B feature): [Planned] A user from a supplier company that the SMB interacts with. A supplier can list their products in the system and see orders placed by the SMB for those products. Suppliers will have access only to the supplier portal portion of the system – they can manage their product catalog and view incoming orders from connected businesses, but cannot see the SMB’s private CRM data beyond what’s relevant to the order. (This role will be introduced when the marketplace functionality is built; it will be isolated at the data model and UI level.)
	•	System Administrator (internal): Our SaaS platform’s super-admin. Not exposed to end-users, but exists for us to manage the system (e.g. support, troubleshooting). Can access any tenant’s data if needed for support (with strict logging). This role ensures we can comply with data export or deletion requests and perform maintenance. (This is an internal role, not a customer-facing role, and will have access via internal admin tools.)

Permissions by Role: (within their tenant unless stated otherwise)

Action / Module	Owner/Admin	Manager/Staff	Read-Only	Supplier (future)
Manage customers (CRUD)	✔ Create/Edit/Delete all customers; can import/export contacts	✔ Create new customers, edit those assigned to them; maybe no deletes (configurable)	🔍 View only	❌ (no access to CRM customer list)
Manage orders (CRUD)	✔ Full create/edit/delete any order	✔ Create orders and update status; delete own drafts	🔍 View only	✔ View orders from connected businesses that ordered supplier’s products; update order status on their side (e.g. mark as shipped)
Manage products/catalog	✔ Manage product list/inventory for the business	✔ If permitted, can update inventory or add products (configurable)	🔍 View product list	✔ Manage their own product catalog (supplier’s products); cannot see SMB’s products
Shipping Integration (Nova Poshta)	✔ Configure NP API key; generate shipments (TTNs) for any order	✔ Generate shipments for orders they created or assigned; print labels	🔍 View shipment status	✔ If fulfilling an order, can update tracking info for their shipped goods
Communication (Email/SMS)	✔ Configure email/SMS provider settings; send bulk communications	✔ Trigger individual emails/SMS to customers (e.g. send invoice)	❌ (no send permission)	❌
User Management (invite/remove users)	✔ Invite or remove users, assign roles in their org	❌ (cannot invite/remove)	❌	❌
Organization settings (billing, subscription, white-label config)	✔ Full access (choose plan, payment info, set branding)	❌	❌	❌
Access data of other orgs	❌ (isolated to their org only)	❌	❌	❌ (supplier sees only their own data and specific order info shared by a connected org)

(The supplier role’s capabilities will be implemented in a later phase; for MVP, only Admin and Staff roles are active.)

Technical implementation: We will enforce these permissions both on the client (conditional UI elements) and the server. Supabase’s Row-Level Security (RLS) will isolate data per organization, ensuring no cross-tenant data leaks. RLS policies will use the user’s organization_id (part of JWT claims) to filter rows. Additionally, a role claim will be used so that certain operations (like deletion) are only allowed if role = admin. On the application side, Next.js server actions and API routes will perform role checks as needed for sensitive actions. This dual layer (database and app-level) ensures robust permission control.

3. Functional Requirements

Below are the functional requirements, organized by feature area. The MVP will implement core functionality for customer management and order management, with minimal extras. Future features are noted for context but will be slated for later releases.

3.1 Customer Management (CRM Contacts):
	•	Create & Edit Customers: The user can add new customers with basic details: name, contact info (phone, email), company (if B2B client), address, and notes. Editing/updating customer info is allowed. All customer data is tied to the user’s organization (tenant).
	•	View Customer List: A searchable, filterable list of all customers. Users can search by name, phone, or other fields. Basic filters might include by tag or customer group (if tags are supported later).
	•	Customer Details View: Viewing a single customer shows full details and a history of orders/transactions with that customer (list of orders, with status). In MVP, this can be a simple list of order references.
	•	Delete/Archive Customer: Admins can remove a customer (which might archive the record for compliance rather than hard-delete, to maintain order history integrity). MVP may implement a “soft delete” (flag as archived) so that orders tied to that customer remain referenceable.
	•	Import/Export Contacts (Planned): Not in MVP, but design will consider allowing import of customers via CSV and export of customer list, to ease onboarding and compliance (data portability).
	•	Notes/Activity (Planned): Future: ability to add notes or log interactions per customer (e.g. calls, meetings). MVP might skip this, but data model can accommodate a customer_notes table later.

3.2 Order Management (Sales Orders):
	•	Create Order: Users can create new orders linking one of the customers. An order includes: order ID/number, associated customer, date, list of items or services, quantity, price, and total amount. For MVP simplicity, line items could be free-text description with price and quantity (no complex product catalog arithmetic), or if a product catalog exists, allow selecting products (see Product Management). The order form also allows setting a status.
	•	Order Status Workflow: Orders have a status lifecycle (e.g. Pending, Confirmed, Shipped, Completed, Cancelled). MVP will support manual status updates. (E.g., when payment is received or item shipped, user updates status). In future, status could auto-update on events (like auto-“Shipped” when a tracking number is generated).
	•	View Orders List: A list of orders with key info (order number, customer name, date, status, total). Able to sort and filter (e.g. view all Pending orders, or filter by date range).
	•	Order Details & Edit: Viewing an order shows all details including customer info, items, totals, and shipping info (if applicable). Users (with permission) can edit order details or correct mistakes while in certain statuses (e.g., allowed in Pending but not after Completed, depending on business rules). MVP will allow editing basic fields and items; more strict workflow rules can be added later.
	•	Delete/Cancel Order: Users can cancel an order (mark as Cancelled status). Hard deletion of orders is typically not allowed if it involves financial records; so MVP might allow deletion of draft orders (unconfirmed) and require cancellation for others to preserve history.
	•	Basic Analytics (Planned): Not in MVP, but eventually provide summary reports (e.g. total orders per month, top customers). The design will ensure orders have timestamps and structured fields to enable future reporting.

3.3 Product & Inventory Management (Lightweight, optional in MVP):
	•	Product Catalog: Optionally in MVP if many SMBs need to list products. This module allows the business to maintain a list of products or services they sell: name, SKU, price, perhaps stock quantity. This can streamline order creation (choose items from list).
	•	If implemented in MVP: enable CRUD of products and selection of products in order form (auto-fill price).
	•	If not MVP, orders will have free-form line items (user enters description and price manually), but the data model will be planned to support a product table later.
	•	Inventory Tracking (Future): Possibly track stock levels of products and decrement on orders. Not in MVP due to complexity; planned for businesses that require inventory control.

3.4 Integration: Nova Poshta Delivery API:
	•	Generate TTN (Consignment Note): The system integrates with Nova Poshta’s API for shipments. Users can input shipment details (recipient address, package weight, etc.) and call the API to create a shipment directly from an order. This returns a TTN (tracking number) which is saved in the order’s shipping details.
	•	Print Shipping Label: After generating a TTN, allow user to get a PDF or label for that shipment (Nova Poshta API provides label link or PDF). MVP can offer a link to Nova Poshta’s site for label printing if direct PDF retrieval is complex.
	•	Track Shipment Status: The system can fetch the delivery status by TTN via API. MVP implementation: a user can click “Track” on an order, and the system calls Nova Poshta’s endpoint to get current status (delivered, in transit, etc.) and displays it. Optionally, a background job can periodically update shipment status in the database (e.g. via a cron function checking all active shipments daily).
	•	Address/Office Autocomplete (Planned): Nova Poshta has APIs for finding nearest offices or validating addresses. Could be added to improve UX when creating a shipment (dropdown of cities, offices). MVP might not include this; user enters address text manually.
	•	The integration will use Nova Poshta’s official REST API (using API key from the business’s Nova Poshta account). We will include a settings screen for the admin to save their Nova Poshta API key. All Nova Poshta API calls will be server-side (to keep the API key secure), either via Next.js API routes or Supabase Edge Functions.

3.5 Communication (Email and SMS Notifications):
	•	Email Notifications: Ability to send emails to customers or to the business’s staff from the system. MVP focus: send an order confirmation email to a customer when an order is marked as confirmed/shipped (trigger manually by user clicking “Send Invoice/Confirmation”). The content can be a simple template with order details. We will integrate an email service (like SMTP via Supabase or a service like SendGrid). Because this is MVP on free tier, we might use Supabase’s email (if they have SMTP) or a free-tier of an email API. Emails should include the business’s name and comply with opt-out if marketing (but these are transactional messages in this context).
	•	SMS Notifications: Similar use-case (e.g., send SMS with order status or delivery info). However, SMS integration may incur cost. MVP may not implement SMS sending to avoid cost/complexity, but the design leaves room for plugging in an SMS API (like Twilio or a local Ukrainian SMS provider) as an add-on module. Possibly provide a placeholder or a simple implementation (like using email-to-SMS gateways for test).
	•	Internal Notifications (Future): In-app notifications for events (e.g. “New order created by team member” or “Payment due for subscription”) could be added. Not in MVP scope explicitly, aside from basic success/error toasts for user actions.

3.6 User Management & Authentication:
	•	User Registration & Login: Utilize Supabase Auth for user sign-up, email authentication, and login. Users can register their organization and initial admin via an email and password or magic link (Supabase supports magic link login, which might be user-friendly in a mobile context). Ensure email verification is done (Supabase can enforce confirmed emails).
	•	Organization Creation: When a user signs up as an admin, an Organization record is created linking that user as the owner. This sets up a multi-tenant context. Other team members can be invited by the admin via email invitation.
	•	Invite Users: Admin can invite a user by email to join their organization. The system will send an invite link (could leverage Supabase invite or a custom token) for the new user to set up credentials. On acceptance, the new user gets a role (manager or read-only, as chosen by admin).
	•	Authentication State Management: Use Supabase’s client libraries or Next Auth (if needed) for session handling. Likely, we’ll rely on Supabase’s JWT and context – the Next.js app will use Supabase’s session in React Context for client-side state, and Server Components can retrieve the user from cookies. Protect routes so that only logged-in users with valid sessions (and correct role) can access data.
	•	Password Reset: Provided by Supabase (users can request password reset email via Supabase’s built-in flows).
	•	Multi-Tenancy Isolation: Every request will include user’s JWT which contains sub (user id) and role and a custom claim for organization_id. This is set at login by our logic (Supabase allows adding JWT claims on login via custom JWT hooks). All data fetching queries will filter by this organization_id. This way, even if a malicious request is made with a valid JWT, the database will not return data outside that org. This is crucial for isolation ￼. Also, our API endpoints will parse the user context and ensure any resource accessed belongs to that user’s org.

3.7 Other Functional Aspects:
	•	Offline Mode Functionality: When offline (no internet), the user should still be able to open the app (if previously loaded) and see some data (last cached customers/orders) and potentially create new records (e.g. a new order or new customer). These offline-created records will be stored locally and synced to the server when connection is restored. (Details in section 10.) This means the app must detect offline status and queue actions.
	•	Internationalization (i18n): The UI will be in Ukrainian by default. We will structure text labels using i18n libraries or JSON dictionaries so that adding English (and other languages) later is straightforward. MVP might not provide a language switch in the UI, but the groundwork (externalized strings, right date/number formatting) will be done. This ensures future expansion beyond Ukraine requires minimal changes.
	•	White-label Support (Planned): For a future premium tier, the system should allow white-labeling. Functional requirement: the ability to use a custom domain and custom branding (logo, colors) for a customer’s instance. In the design, we’ll keep branding variables (logo URL, theme colors) configurable at the organization level. MVP: we’ll at least make the UI themable (dark/light mode, maybe color scheme) and store an organization name & logo that can be shown in the UI (like in header or reports). Full white-label (custom domain and remove our branding) will be implemented later, but we note it to ensure architecture can support per-tenant theming.
	•	Open API (Future): Eventually, provide a public API so customers or third-party developers can integrate their own apps or build modules (e.g. pull CRM data into another system). This likely means exposing a REST or GraphQL API with API keys per organization. Not in MVP, but the internal API design will keep this in mind (e.g. using RESTful principles for internal endpoints ￼ so that opening them later is easier, and versioning them properly).

All these functional requirements for MVP are chosen to keep the scope lean (primarily contacts + orders + basic integration), while setting the stage for easy extension. The system is modular by feature, meaning each of these domains (customers, orders, etc.) is relatively self-contained in code, which aligns with the Feature-Sliced Design approach and allows adding new modules like “inventory” or “supplier portal” with minimal impact on existing features.

4. Non-Functional Requirements

Beyond features, the system must meet various non-functional criteria to ensure a good user experience and maintainability:
	•	Performance: The app should be responsive on both desktop and low-end mobile devices. Pages (especially main dashboard lists) should load within ~2 seconds on average connections. We leverage Next.js Server Components to pre-render data-heavy pages so users see content quickly ￼. Database queries will be indexed appropriately for fast retrieval (e.g. index on organization_id, foreign keys, etc.). On Vercel’s free tier, serverless function cold starts should be minimized by keeping functions lightweight. We will monitor query performance and use pagination or lazy-loading for large datasets to avoid long blocks.
	•	Scalability: Design for gradual scaling. MVP runs entirely on serverless and managed services (Vercel + Supabase) which can handle a modest load out of the box (the free tier supports up to 50k users and unlimited API calls in theory ￼). The architecture is stateless and easily horizontally scalable by nature (Next.js serverless functions scale on demand) ￼. Data and business logic are structured in modules so that in the future, we can split services (e.g. move heavy processing to separate worker) without refactoring core modules. The modular monolith approach ensures we don’t start with needless microservices but can evolve there if needed ￼ ￼. We anticipate scaling in two dimensions: more tenants (so ensure multi-tenant efficient queries and caching), and larger individual tenants (so ensure queries per org can be optimized, and heavy operations moved off the request cycle).
	•	Security: All data must be securely handled. Use HTTPS for all network requests (enforced by Vercel and service worker). Supabase provides SSL for DB connections. We implement Row-Level Security in Postgres to prevent any data leakage across orgs. Authentication tokens (JWTs) are stored securely (HTTP-only cookies or secure storage) and passed only over HTTPS. We will utilize Supabase’s built-in auth security (password hashing, email verification). Protect against common web vulnerabilities: Next.js has built-in defenses (automatic escaping in JSX, etc.), but we will also sanitize any user-generated content that might be rendered (though in CRM, not much free text HTML content). Use Content Security Policy for our application (especially since it’s a PWA with service worker) to prevent XSS ￼. Additionally, ensure proper access control checks in server actions so one org cannot act on behalf of another even if they manipulated IDs.
	•	Reliability & Availability: Even on free tiers, we aim for high uptime. Vercel’s and Supabase’s uptime is generally good; however, free projects can pause on inactivity (Supabase free will sleep after a week of no requests, but with active users this won’t happen). We consider implementing a heartbeat or some periodic job to prevent long inactivity if needed (or accept a slight cold start delay if truly no usage for a week). We won’t rely on any single machine state (stateless architecture means easier recovery). Data is stored in a managed Postgres with daily backups (Supabase free doesn’t include long retention, but we can perform manual backups periodically). In the target architecture, we’ll have redundancy (e.g. a read-replica DB or failover, but not in MVP).
	•	Maintainability: Emphasize clean code architecture. The codebase follows Feature-Sliced Design (FSD) principles to organize by features, making it easy for developers to find and modify code related to a given business domain ￼. Each feature module will expose a clear public API and remain internally isolated, reducing interdependency ￼. This means future developers can add a new module (say, “Inventory”) without touching unrelated parts, lowering risk of regression. We use TypeScript across the stack to catch errors early and self-document the data models and APIs. Configuration (like API keys, environment-specific settings) is centralized and injected via environment variables, easing deployments and migrations. We also plan to maintain infrastructure as code (for any supabase config, etc., using scripts) so environments can be reproduced.
	•	Extensibility: The system should accommodate new features and integrations easily. Using a module/plugin approach (design patterns to register new routes or components for new modules) will be considered. For instance, the architecture accounts for paid modules by designing feature flags or module toggles (e.g. each module can check if org’s subscription includes it). The open API planned means we design internal services in an API-friendly manner now (consistent REST endpoints, proper versioning path like /api/v1/... for any public API) ￼. UI is built with reusability in mind: common components (forms, lists) in a shared library so new pages can be spun up quickly with consistent behavior.
	•	Offline Capability: As specified, the app will function offline (to a reasonable extent). This means the non-functional requirement is that core screens (recent customers and orders) load from cache without network, and that new entries can be saved offline (in local storage or IndexedDB) with no crashes. The user should be informed of offline status gracefully and see that data will sync later. The service worker must cache static assets and critical API responses. Even if offline, the app should be usable for at least 30 minutes with no connection for common tasks (recording an order), queuing those changes reliably.
	•	PWA compliance: We will adhere to PWA standards – a web app manifest (with icons, theme color, etc.) for installability, a service worker for offline caching and push notifications support (maybe not used in MVP except for offline, but available to extend). This ensures the app can be “installed” on Android and iOS (iOS from 16.4 supports installed PWA push) ￼ ￼. Non-functional expectation: the app feels like a native app (launches full-screen, has an icon, etc.).
	•	Compliance (Legal): (Expanding in section 11) The system must comply with GDPR and Ukrainian data laws. From an NFR perspective, this means implementing data encryption where appropriate, obtaining user consents for data processing if needed, and providing mechanisms for data export/deletion. Also, keep audit logs of critical changes (for now, maybe just who did last update on an order or deletion markers – full audit trail can be a future enhancement).
	•	Privacy & Data Protection: Users’ data privacy is paramount. We ensure personal data is protected from accidental loss or unauthorized access as required by law ￼. All personal data fields (names, contacts) are stored in the secure Postgres (not in client storage except cached offline in IndexedDB which is sandboxed to user’s device). Backups or exports will be handled carefully (encrypted at rest). We will have a privacy policy and terms of service clearly stating data usage. No personal data will be shared with third parties except as needed for functionality (e.g. sending an SMS via a gateway, which will be covered in the privacy policy).
	•	Usability: (UX principle as NFR) The application should be intuitive for non-technical users. That means minimal training required, clear labels (in Ukrainian), and sensible defaults. We plan to follow standard UX practices and test with a few beta users for feedback. Error messages should be helpful (e.g. validation errors telling exactly what’s wrong).
	•	Accessibility: The UI will use accessible components (ShadCN/UI which is built on Radix primitives ensures accessible dialogues, etc.). We will add proper ARIA labels to interactive elements and ensure color contrast is sufficient by design (Tailwind config and theme will consider this). This is not only to widen potential user base but also aligns with quality.
	•	Free Tier Limits Adherence: As a special NFR for MVP – the solution must operate within the free tier constraints of our chosen platforms. This means:
	•	Keep database storage under 500MB initially (which is plenty for textual data like CRM records). We’ll not store large blobs in DB; any files (like product images or attachments) will go to Supabase Storage which has 1GB free limit ￼. We will also encourage image uploads to be small (maybe thumbnails) to conserve space.
	•	The monthly bandwidth and function call limits of Vercel and Supabase must not be exceeded in early usage. Vercel free allows ~100 GB bandwidth and ~100k serverless invocations per month ￼. We will optimize our network usage by caching frequently accessed data on the client (less repeated calls) and possibly using incremental static regeneration for any mostly-read pages if applicable. Also, avoid any infinite loops or polling that could accidentally blow through invocations.
	•	If certain features could threaten limits (e.g. an aggressive background sync running too often), we’ll configure them conservatively (maybe sync only when app is foreground or a manual sync button, rather than constant background polling).
	•	No use of external services that are not free: e.g. we won’t integrate a paid maps API or a paid SMS gateway for MVP unless they have a free tier or we mock the functionality.
	•	Testability: We aim to make the system test-friendly. Use of TypeScript, modular design, and possibly integration tests (with Playwright or similar for critical flows) will ensure we can catch issues. This is more internal, but as an NFR it means the architecture (e.g. separating business logic into functions that can be unit tested, not burying logic in UI) is important.
	•	Logging & Monitoring: Even on MVP, we need basic monitoring. Vercel provides logs for functions (only 1 hour retention on free, but enough for debugging issues ￼). We will also utilize Supabase logs (though free only 1 day retention). We plan to set up an alert or at least periodically check these to catch errors (especially in Edge Functions or cron jobs). In production later, we’ll integrate a proper monitoring tool, but MVP minimal viable logging is acceptable.

In summary, the system is designed to be robust, secure, and user-friendly from the start, even if running on free-tier infrastructure. We consciously enforce multi-tenancy and security best practices now to avoid costly architectural corrections later (for example, implementing tenant isolation from day one as a fundamental principle ￼). The combination of a scalable Next.js architecture and Supabase’s managed backend gives us a strong foundation to meet these non-functional needs for MVP and beyond.

5. System Architecture (MVP and Target)

This section describes the overall architecture of the system, first at the MVP stage (using the specified tech stack on free tiers) and then the target architecture for scaling (when migrating to our own VPS and additional services). We also address code organization (FSD) as part of architecture to ensure maintainability.

5.1 MVP Architecture (High-Level)

The MVP architecture is a full-stack JavaScript/TypeScript setup utilizing Next.js 16 and Supabase, all deployed on managed services (Vercel and Supabase cloud). It’s essentially a 2-tier architecture (Client and Cloud), with a thin separation between front-end and back-end:
	•	Client (Browser/PWA):
	•	The user accesses the app via a browser (mobile or desktop). The app is a Progressive Web App served by Next.js. It consists of mostly React Server Components (RSC) for initial render and some client components for interactivity.
	•	When installed as a PWA, it runs in a standalone window and can cache assets and data for offline use.
	•	The client uses React for UI, shadcn/UI components styled with Tailwind CSS for a consistent look. React Context is used for global UI state (theme toggle, online/offline status, currently logged-in user info) and for simple state like form modals.
	•	Zustand (a lightweight state management library) is used for business state that might need to be shared outside React’s tree or for more complex interactions (e.g. a global cart or multi-step form data, if needed). In MVP, Zustand could manage offline data queue or caching of fetched lists for example.
	•	The Service Worker (registered by the PWA) caches static assets (Next.js bundles, images) and some API responses. It also may intercept requests while offline to serve cached data or queue requests (for sync, we might implement background sync events).
	•	The client communicates with the server either by standard web requests (HTTPS calls to Next API routes or Supabase endpoints) or via real-time channels (Supabase Realtime if used for things like instant updates).
	•	Web Server and API (Next.js on Vercel):
	•	We deploy the Next.js 16 application on Vercel (Hobby plan). Vercel handles serving the pages (with Next’s App Router) and running serverless functions for any API routes or server actions. Next.js is in full-stack mode: meaning our pages can fetch data on the server side (RSC or getServerSideProps if needed), and we define Server Actions (Next 16 feature) for form submissions or events that mutate data.
	•	Next.js App Router allows us to colocate route logic and UI. We use file-based routing for pages (e.g. /customers/page.tsx to list customers, /api/webhooks/[...].ts for API endpoints).
	•	Server Actions: For example, when an admin submits a form to create a new order, a Server Action defined in the component will run on the server (Vercel function), perform the DB insert via Supabase, and return the result. This eliminates the need for a separate API call from client for many internal actions – it’s handled by Next.js seamlessly.
	•	API Routes: We still use Next.js API routes for certain cases:
	•	Webhooks from external services (e.g., if using Paddle or LiqPay for payments, they will send a webhook to our /api/webhook/payment route to signal payment success).
	•	Any REST endpoints we expose for integration (not in MVP for external, but e.g. an /api/npProxy route to proxy Nova Poshta requests if we did that, although likely we call NP directly from server actions).
	•	Possibly, endpoints for Supabase to call via webhook (Supabase can trigger HTTP requests on DB changes – not used in MVP, but an option).
	•	Edge Functions vs Next API: We have a choice: some back-end logic could run as Supabase Edge Functions (which run on Deno in Supabase’s infra) or as Next API routes (Node on Vercel). For simplicity, MVP will implement most logic in Next (to keep everything in one codebase). We will use Supabase Edge Functions primarily for scheduled tasks or when we need to react to DB events with low latency. E.g., a daily cron job to update shipment statuses might be done with a Supabase Scheduled Function hitting the NP API and updating the DB.
	•	Supabase Client in Next: On the server side, Next will use the Supabase SDK (with admin privileges via service role key in env) for data operations. On the client side, we may use the Supabase JS client in restricted ways (for example, subscribing to real-time updates). But generally, data fetching in React will happen through server components (which in turn call the DB) or via calling our server actions. This ensures all database writes go through a controlled environment (we can enforce business rules in server code or DB).
	•	Authentication integration: We are using Supabase Auth, but we integrate it with Next.js. For example, after a user logs in via Supabase (using the provided UI or our custom form that calls supabase.auth.signInWithPassword), we will set a cookie with the Supabase JWT. We might use the Next.js Middleware to protect routes by checking that cookie or use Supabase’s helper to get user session in server-side. Supabase JWT includes the user’s UID and their role/claims. We’ll pass this to the database on queries (the Supabase JS client does this automatically for reads with RLS).
	•	File Storage: Supabase Storage will hold any file uploads (if we add the ability to upload, e.g., product images or customer photos). These files are stored in an S3-compatible bucket. The Next app or client can retrieve them via signed URLs from Supabase. For MVP, file usage will be minimal (maybe just organization logo upload for white-label branding; we can store that in Supabase Storage).
	•	External Integrations from Server: The server (Next or Supabase functions) will handle calling external APIs:
	•	Nova Poshta API calls: done server-side using fetch/axios from within a server action or edge function (with NP API key stored securely in env or Supabase secrets).
	•	Email sending: either via a third-party API (like SendGrid’s REST API) or via SMTP. If SMTP, we might use an SMTP library on a serverless function – but note Vercel serverless cannot maintain long connections; sending single emails is fine. Alternatively, Supabase offers an email sending (they have SMTP settings for their Auth emails which we might piggyback for custom emails or use their SMTP relay).
	•	SMS sending: similar approach (REST API call to provider).
	•	These calls are short-lived and synchronous mostly (generate TTN, send email). We ensure they either happen in user-triggered actions (so user waits a second for response) or we offload to a background function if they are slow. For instance, if generating 100 shipment labels at once, we’d schedule that in background, but in MVP it’s one by one.
	•	Stateful background tasks: Since we cannot run a background daemon on Vercel, any background processing is event-driven. Options:
	•	Use Supabase’s pg_cron and pgmq (message queue) to schedule tasks and a Supabase Edge Function to process them. For example, when an order is created with a request to notify customer by email, we could insert a row into a email_queue table. A Supabase cron job (pg_cron) wakes every X minutes and invokes an Edge Function, which reads from the queue (using pgmq) and sends the emails ￼ ￼. This effectively emulates a worker queue (and Supabase Edge Functions allow ~150s runtime on free tier, vs Vercel’s ~10s).
	•	Alternatively, use Vercel’s Cron feature: Vercel supports scheduled function triggers (on pro plan) – but on free, we might not have it, hence relying on Supabase.
	•	For MVP, we will implement at least one scheduled job: a daily summary or daily shipment status check. This can be done by enabling the Supabase Cron integration (which uses pg_cron). It’s free to use, just need to ensure the project is on a supported Postgres version ￼.
	•	This architecture avoids external services (like no separate Redis or job runner) by leveraging built-in DB extensions. It’s a clever hack to meet the “no paid services” constraint.
	•	Database (Supabase Postgres):
	•	At the core, we have a PostgreSQL 15 database provided by Supabase. This stores all persistent data: users, orgs, customers, orders, etc. Supabase adds an API layer (PostgREST) and auth on top, but logically it’s our main DB.
	•	We structure the DB with a schema, likely the default public schema for app tables and Supabase’s internal schemas for auth and storage. Each table that is tenant-specific will have an organization_id field to partition data. RLS policies will typically be of the form auth.uid() in (select user_id from memberships where memberships.org_id = organization_id and memberships.user_id = auth.uid()) or simpler if we encode org_id in JWT.
	•	Supabase Auth uses its own tables (auth.users etc.) but we can reference those IDs in our tables. We might have a profiles table to extend user info if needed.
	•	Triggers: We might use database triggers for certain logic (for example, after insert of an order, increment a counter, or for soft deletes). Supabase allows custom SQL and PL/pgSQL triggers. MVP should minimize over-engineering here; critical logic can live in app code for clarity. But if using pgmq (message queue extension), that itself uses stored procedures to enqueue/dequeue tasks.
	•	The database also provides Realtime via Supabase’s replication slot. If we enable it on a table, clients can subscribe to changes (over websockets). MVP plan: we could use Realtime to have, say, an order list auto-refresh when a new order is added by another user (collaboration). Given free tier allows 200 concurrent connections and 2M messages ￼, we can enable realtime on key tables (orders, maybe). The Next.js front-end can open a websocket via Supabase client to listen for changes and then update Zustand state or revalidate queries. This avoids polling.
	•	Supabase Storage: as mentioned, for file uploads. Under the hood, it’s an S3 store, but it’s part of our backend.
	•	Third-Party Services:
	•	Nova Poshta API: external REST service; our server calls it for shipping. No data from NP is stored beyond what we need (tracking number, maybe shipping cost). The API key is stored in Supabase’s config (possibly in a secure vault or as an env variable in Vercel, though ideally not in Vercel since integration is for each org – so each organization might have their own Nova Poshta API key saved in our DB encrypted, or we might use one account and key for all if that’s feasible).
	•	Email/SMS providers: similarly external. For MVP, to avoid costs, we might use a free email service. (For example, Supabase might by default send auth emails from a domain – we could potentially piggyback or just use a service like Ethereal for dev/test.) In production, likely use SendGrid (which has a free tier up to 100 emails/day) or a similar service. For SMS, maybe use a placeholder or allow integration with a provider by configuration.
	•	Payment Gateway (for subscriptions): If we implement billing in MVP, we will use a service like Paddle or Fondy (since Stripe isn’t available for Ukrainian businesses ￼ ￼). This service will be external and will call our webhook on successful payment. Paddle, for instance, can handle recurring billing and then send events; we just update our DB accordingly.
	•	These third-party integrations are decoupled from core logic – each is accessed via an adapter (for instance, a utility function for “sendEmail” that we can swap out implementation). This ensures that if we migrate infrastructure, these integrations remain working with minimal changes (maybe just different API keys or using self-hosted alternatives if needed).

Summary of Data Flow: A typical request in MVP: e.g., the user opens the Orders page on their phone. The request goes to Vercel, Next.js server renders the page by querying Supabase Postgres for that org’s orders (using either Supabase JS SDK or PostgREST). The page HTML is sent back and displayed. The user clicks “Create Order”, fills a form, and hits submit. The form action calls a Next server action, which executes on Vercel – it uses Supabase admin client to INSERT a new order row into Postgres. Postgres triggers any RLS checks and inserts. If successful, the server action responds to the client (maybe with the new order ID or a redirect to orders list). Meanwhile, Supabase’s real-time could push the new order to any listening clients (so if another team member has the list open, they get the update). The user’s browser, now back on the orders list, shows the new order immediately (either via the returned response or via a revalidation triggered by that mutation). If offline at any point, the Service Worker and app will queue the action – e.g., if they tried to submit order offline, we intercept and store it, then sync to server when online (discussed in Offline section).

This architecture leverages serverless functions and managed services heavily, which aligns with the constraints (no custom servers for MVP, everything in free tier). It’s also highly portable later: the Next.js app is framework-agnostic about hosting (could run on a Node server on a VPS), and the database is just Postgres (could migrate to self-hosted Postgres). We intentionally do not use any proprietary Vercel features that lock us in (like if Vercel had some exclusive API, we avoid it; Next.js remains standard). Similarly, Supabase’s features like pg_cron, etc., are based on open extensions – if we self-host Postgres, we can enable those extensions as well to replicate functionality.

5.2 Target Architecture (Scaling on VPS and Beyond)

As the user base grows or requirements outgrow the free tier, we plan to migrate to a more robust self-hosted or paid setup. The target architecture builds on the MVP by introducing dedicated services for performance and reliability, while preserving the core design. The principle is evolution, not revolution – no complete rewrite, just swapping components or adding new ones in place ￼.

Infrastructure Shift: We’ll move from Vercel/Supabase to a VPS or cloud cluster (could be a single powerful VM or a Kubernetes cluster, depending on scale). The application will be containerized (Docker) or set up via Node.js on the server.

Key changes and additions in target architecture:
	•	Web/App Server: Instead of Vercel’s serverless, we’d deploy the Next.js app on a Node.js server (possibly behind PM2 or in a Docker container orchestrated by Docker Compose or K8s). We might still use Next.js in production mode with serverless-like behavior (Next can be run as a Node server serving both pages and API). With this, we aren’t constrained by Vercel’s limits (like 10s execution). We can handle long-lived processes (websockets, background jobs if needed).
	•	If high traffic, we can run multiple instances of the Next.js server behind a load balancer (Nginx or cloud LB). Sessions are stateless (all auth is JWT-based), so scaling horizontally is fine. We might use sticky sessions if we introduce caching layers, but likely not needed if stateless.
	•	We might separate the API from the front-end at this stage: e.g., run Next.js for front-end pages, but heavy API endpoints could be broken into a separate service (especially if we decide to create a separate back-end service or use a different framework for some microservices).
	•	However, to minimize complexity, initially we can keep it unified (monolith). Only once absolutely needed, extract microservices. For example, a dedicated service for handling long background tasks or an external-facing public API service if load dictates.
	•	Database: We can either continue using Supabase’s database by upgrading to a paid plan, or migrate to a self-hosted Postgres instance. Likely, to reduce cost long-term and have more control, we’ll migrate to Postgres on a VPS (or a managed PostgreSQL from a cloud provider). We will:
	•	Export the data from Supabase (they allow a dump or continuous replication).
	•	Ensure the new Postgres has the same schema and RLS policies configured. (Supabase’s RLS and extensions can be replicated since it’s standard Postgres with extensions like pgjwt for JWT claims.)
	•	Supabase Auth: If we leave Supabase entirely, we need to replace the auth system. Options:
	•	Self-host Supabase Auth (also known as GoTrue). It’s open source, so we could run our own instance of GoTrue to handle logins, or switch to a different auth method. Another approach is to integrate a library like NextAuth or a cloud service like Auth0; but migrating user accounts (password hashes, etc.) from Supabase might be tricky.
	•	A simpler path: before migrating, encourage users to use email/password (so we have hash) rather than magic links (which rely on Supabase). Export the user table from Supabase (which includes bcrypt hashed passwords). Then in the new setup, use those hashes in a custom auth system. Alternatively, if we cannot export hashes, we might force a password reset for all users as part of migration (tell them to set a new password on new system).
	•	In any case, we plan for this by abstracting auth logic somewhat. MVP code uses Supabase’s client for auth, but we can refactor to use an interface such that switching auth backend doesn’t require changing every component. For example, wrap Supabase’s calls in our own AuthService class.
	•	For Realtime: If we leave Supabase, we lose their realtime service. But we can replace it with an alternative:
	•	Postgres Logical Decoding + WebSocket: We could use a library like Hasura or PostGraphile for realtime, or roll our own using pg_listen and broadcasting to WebSocket clients (perhaps via a Node process or Redis pub/sub).
	•	Or simpler, since Next.js server can maintain state now, we could integrate something like Socket.IO or use Redis Pub/Sub with a small Node subscriber to push events to clients. We might also decide that realtime updates are not critical at small scale and rely on polling or manual refresh for a bit, then implement websockets when needed.
	•	For storage (files): we’ll migrate files from Supabase (S3) to another storage:
	•	Possibly set up an S3 bucket on AWS or a MinIO server on the VPS. Update file upload endpoints to point there. Users likely won’t notice if URLs remain similar. Alternatively, if few files, we can even keep using Supabase storage for a while since it’s static and not costly, but better to consolidate.
	•	Redis: Introduce Redis on the new infrastructure to handle caching and sessions:
	•	We can cache frequently accessed queries (like reference data, or heavy aggregate results) in Redis to improve performance under load.
	•	Use Redis for sessions if we move away from JWT (though likely we keep JWT stateless auth to avoid that complexity).
	•	Use Redis for pub/sub to implement a simple message bus (for example, when a new order is created, publish an event that other parts of the system or WebSocket server can listen to and notify users).
	•	Search: If search requirements get complex (like full-text search on customers), we might add something like Elasticsearch or an open-source alternative. But likely Postgres full-text search can suffice for names, etc. This is optional and only if needed for performance or advanced querying.
	•	Background Jobs & Queue: For robust background processing on our own infra:
	•	We will deploy RabbitMQ or NATS as a message broker (depending on preference). RabbitMQ for traditional reliable queues or NATS for lightweight event streaming. RabbitMQ might be more familiar for task queues.
	•	We will create one or more Worker Services – these are small apps or scripts that subscribe to queue topics and perform tasks (e.g. sending emails, generating reports). For instance, when an email needs to be sent, the Next app instead of calling directly could put a message on email_queue. A worker (running continuously on the server or in a container) will pick it up and send the email. This decouples immediate user response from slow tasks and improves scalability.
	•	We’ll migrate any cron jobs from pg_cron to a system cron or a specialized scheduler. Alternatively, use something like BullMQ (Node based queue with scheduling) or even stick to pg_cron if we keep the DB approach. But likely a system cron or a service like Quartz (if we were in another language) can be used to trigger daily jobs.
	•	Ensure idempotency and monitoring for these jobs (e.g., log job results, retry on fail etc. – easier to manage with RabbitMQ + a library or using a workflow engine if needed).
	•	Web Server for static files and load balancing: If needed, we might put Nginx or another reverse proxy in front of the Next.js app to handle SSL termination, serve static files, and route requests. For example, serve the static assets directly from a CDN or Nginx cache and route /api/ to the app server. On Vercel this was abstracted; on our own we must handle it.
	•	We will use Let’s Encrypt (via Nginx or Caddy) for HTTPS certificates, ensuring all traffic remains secure as before.
	•	Scaling the Database: If the load increases (many tenants, lots of data), we will consider:
	•	Adding read replicas for heavy read operations or analytics.
	•	Partitioning data if needed by tenant (hopefully not needed unless huge scale).
	•	Or migrating to a cloud managed DB for ease.
	•	Use connection pooling (maybe PgBouncer) if many app servers.
	•	Monitoring & Logging: We’ll implement more robust monitoring. Use Prometheus/Grafana or a cloud service to monitor resource usage. Set up alerts for high CPU, low memory, etc. For logs, use a centralized logging (ELK stack or a cloud log aggregator) because we won’t have the nice dashboards from Vercel. This ensures reliability in production.
	•	Security in Target: We will handle our own security updates (maintain OS, DB patches). Possibly containerize each component to isolate (DB in its container, app in another, etc). Use firewall rules to restrict DB access to only the app server. Continue to enforce encryption in transit (HTTPS) and at rest (enable disk encryption on the server, use SSL for DB connections internally too).
	•	Maintaining Multi-tenancy & Configurability: In target environment, we might onboard larger clients (maybe EU ones) needing specific data handling. We ensure multi-tenancy remains strict. Possibly implement per-tenant database schema or separate DB instances if an enterprise client requires it (this could be offered for enterprise/white-label where they get their own DB for 100% isolation).
	•	For now, still one DB with org_id separation. If we needed to, we could spin a separate instance of our stack for a white-label client (since it’s containerized, running another instance with isolated DB is possible, effectively giving them a separate environment – this could be a strategy for white-label deals).

Target Architecture Diagram (conceptual):

User (Browser/PWA/Mobile)
    │
    │ HTTPS (REST, WebSockets)
    ▼
[Load Balancer / Nginx]  — optional layer for scale (SSL termination, static caching)
    │
    │ HTTP to app servers
    ▼
[Next.js App Server(s)]  — running our Node.js app (pages + APIs + server actions)
    │    │
    │    ├─ (Reads/Writes) → [PostgreSQL Database]  — hosted on VPS or managed service
    │    │              (with RLS, storing all multi-tenant data)
    │    │
    │    ├─ (Cache) ↔ [Redis] — for caching frequent queries, session store, pub/sub
    │    │
    │    ├─ (Queue push) → [RabbitMQ] — sends tasks to background queue
    │    │
    │    ├─ (File upload/download) ↔ [Object Storage] — e.g. S3 or MinIO for files
    │    │
    │    └─ (External API calls) ↔ Nova Poshta, Email API, Payment API, etc.
    │
    └→ [WebSocket Server] (could be part of Next app or separate) — pushes realtime updates using Redis pub/sub or DB triggers.
         (Not separate if using same app with Socket.io, but could scale separately)

[Background Worker(s)] — separate process(es) pulling from RabbitMQ
    ├─ Email Worker: sends emails via SMTP/SendGrid
    ├─ Notification Worker: sends SMS or push notifications
    ├─ Integration Worker: handles heavy external API sync (e.g., periodic sync with a supplier’s system)
    └─ etc., can scale independently

(Above diagram is conceptual; in practice, many components might run on the same physical server initially and then on separate nodes as scaling requires.)

The target architecture introduces the message queue and background workers to handle tasks asynchronously, improving user-facing performance (no waiting for email sending, etc.). It also introduces Redis to alleviate database load by caching, and for implementing features like rate limiting or more complex real-time messaging.

Importantly, the core business logic remains in the Next.js app and the database. By the time we migrate, our code is already structured in domain modules (thanks to FSD and the modular monolith approach). To scale, we identify parts of the code or modules that are becoming bottlenecks or need independent scaling:
	•	For example, suppose sending emails or generating reports becomes heavy – we spin that out to a worker, as mentioned. The rest of the app remains unaffected (just producing tasks and reading results).
	•	If the CRM marketplace (B2B2B) feature grows and maybe requires a separate portal or increased security isolation, we could even split the supplier portal into a separate app/service that uses the same DB or an API to the main DB. But if possible, we keep it within the monolith behind feature flags until scale mandates separation.

Data migration plan to target: detailed in section 15, but in short, involves taking over the Postgres data and possibly continuing to use Supabase’s services (we might choose a gradual approach: e.g., first move the Next.js off Vercel to our server but still point to Supabase DB to ensure app runs smoothly, then migrate DB next; or vice versa). We want zero downtime migrations – likely via taking a backup during a maintenance window.

Continuity of design: The architecture changes (adding Redis, RabbitMQ) are done in a way that our code logic doesn’t drastically change:
	•	For example, in MVP, when an order is created, we directly call external APIs (Nova Poshta, email) synchronously. In target, we may instead enqueue them. We can implement this gradually by writing an abstraction in code: e.g. a function notifyCustomer(order) that in MVP directly sends email, but in the new version, publishes to queue. By using the same function name, we minimize code changes – just the implementation bound to environment config (if queue available or not).
	•	Similarly for caching: in MVP, queries go to DB directly; in target, we might wrap certain queries with a cache check. That can be introduced by using a data access layer pattern – e.g. have an OrderRepository class. Initially its getRecentOrders(org) just queries Postgres. Later, we modify it to check Redis first. The rest of the app doesn’t change how it calls OrderRepository.

In essence, no business logic rewrite is needed when moving to target environment, just infrastructural config and minor code refactoring to hook in new components.

5.3 Code Architecture and Patterns (Feature-Sliced Design)

To ensure the system remains maintainable as it grows, we adopt the Feature-Sliced Design (FSD) methodology for the front-end, and a layered, domain-oriented approach for the back-end. FSD will structure our front-end code by feature domains, which aligns well with our modular feature breakdown (customers, orders, etc.) ￼.

Figure: Feature-Sliced Design structure – organizing code by business feature (e.g. Customer, Order), each sliced into layers (UI, model, API). This modular approach makes the architecture adaptable and each feature self-contained, aiding scalability and independent development ￼ ￼.

Front-end Structure (FSD): The Next.js app’s source code will be organized into layers such as entities, features, pages, shared components, etc., per FSD conventions ￼. Concretely:
	•	We separate code by feature slices: e.g., a customers slice, orders slice, auth slice, etc. Each slice contains all the types of files related to that feature (UI components, state management, API calls).
	•	Within a slice, we further separate by layers:
	•	UI layer (components): presentational components for that feature (e.g., CustomerTable, OrderForm).
	•	Model/business logic layer: functions, hooks, or controllers that implement the feature’s logic (e.g., useFetchCustomers hook or ordersService with functions like createOrder).
	•	API integration layer: any code that calls external APIs or the backend for that feature (e.g., a file api.ts in orders slice that has functions to call Supabase or Next API).
	•	Types/constants: define types and constants related to the feature (e.g., OrderStatus enum).
	•	Example: src/entities/order/ might define the Order entity schema and validation; src/features/orderList/ defines the order listing UI and uses the Order entity; src/pages/orders uses those features to assemble the page.
	•	Shared utilities or components (like a generic DataTable or form input) reside in a shared/ or common/ directory accessible to all, ensuring we don’t repeat code across features.
	•	This structure ensures explicit public APIs for each module ￼. For example, the orders module might expose a function placeOrder(orderData) and that is what other parts of the app call, without knowing internal details. This encapsulation means we can refactor internally (or even replace an entire module’s implementation) without breaking others, as long as we keep its public interface.
	•	It also promotes isolation: features are loosely coupled. A feature should not directly depend on the internals of another feature ￼. If communication is needed (say orders needs customer info), it should go through public interfaces of the customers module or shared data definitions.
	•	We will follow the practice of “layer independence”: UI layer only depends on model layer of same or lower (shared) layers, not vice versa. This avoids circular dependencies and keeps logic testable (model functions can be tested without UI, for example).

Back-end Code Organization: Although much back-end logic resides in database (SQL/RLS) and in the Next server actions, we still maintain structure:
	•	We can create a directory for server-side actions by domain, e.g. app/(actions)/orders.ts that contains server action functions related to orders. Next 13+ might allow co-location, but it’s good to logically group them for clarity.
	•	Implement service classes or modules on the server: For example, an OrderService class with static methods like createOrder, getOrders(orgId) could be used by both API routes and server actions. This is a hint of a layered architecture where we separate route handling from business logic. This corresponds to a service layer in classical architecture ￼.
	•	For complex logic, use managers or controllers (could correlate to a manager layer if we follow a full layered pattern ￼). In our scale, might not need an explicit extra layer, but we want to avoid putting too much logic inside API route handlers themselves.
	•	The idea is to make back-end logic unit-testable by not hard-coding it inside Next.js request handlers.
	•	We mirror the feature structure on back-end to some extent: e.g., have matching modules or at least grouping of functions. This symmetry means a developer working on the “Orders” feature will find front-end components and back-end logic in their respective places easily.

Why FSD suits this project: Since our application will grow in features (CRM modules, integrations, etc.), FSD’s focus on business domains makes it easier to add functionality. Each new feature can be a new slice without entangling with existing code, reducing technical debt ￼ ￼. It also helps when multiple developers join – they can work on different slices in parallel with minimal merge conflicts.

Alternative Considered: We considered a traditional layered architecture (e.g., separate folders for “components”, “services”, “utils” globally). While simpler initially, that tends to scatter code by type and can become messy as the project scales (harder to know what affects a given feature). By choosing FSD, we opt for clarity and scalability over a perhaps initially familiar structure. Another alternative is the “Modular Monolith” structure suggested by some SaaS experts, which is actually aligned with FSD: organizing by modules such as auth, billing, core features ￼. We are effectively doing that, with perhaps even more granularity using FSD segments.

FSD in practice example: The “Customers” slice might have:
	•	customers/ui/CustomerTable.tsx (UI component),
	•	customers/model/useCustomers.ts (React hook to fetch customers or state management for customers),
	•	customers/api/customersApi.ts (functions to call Supabase like fetchCustomersList, addCustomer).
	•	customers/index.ts that exports public functions/components of this slice.

Then a page like app/customers/page.tsx simply uses CustomerTable and the hook from the customers slice. If we later decide to change how customers are fetched (say, move from direct supabase call to a call through our Next API for some reason), we only change customersApi.ts implementation, rest stays same.

Conclusion: The system architecture for MVP is cloud-native and minimal, while the target architecture is more robust and service-oriented. Throughout, we maintain a clean code structure (using FSD and layered services) to ensure we can move from one stage to the next without collapsing under technical debt. The approach is evolutionary: start simple (monolithic, managed) and incrementally adopt enterprise-grade components (queue, cache, microservices) as user load and feature complexity demand it ￼ ￼. This ensures we meet immediate constraints (free tier, quick development) and long-term needs (scaling and maintainability).

6. Data Model (PostgreSQL Schema Design)

We design a multi-tenant data model in PostgreSQL that captures the core entities of the CRM. All application data is stored in a relational schema with foreign keys and constraints to ensure consistency. Below is an overview of the main tables and their structures (some columns omitted for brevity):

Table (Entity)	Description	Key Fields & Columns
organizations	Tenants i.e. customer businesses using the CRM.	id (UUID PK), name (text), contact_info, plan (text or enum for subscription plan), created_at, branding (logo URL, theme colors, etc. for white-label)
users	User accounts. (Supabase Auth manages base user info)	id (UUID PK) – corresponds to Supabase auth.user ID, email, name, etc. (could use Supabase auth.users directly). We might have a profiles table to extend info like full_name, phone, avatar.
memberships	Linking users to organizations with roles.	user_id (FK to users), org_id (FK to organizations), role (enum: ‘admin’, ‘manager’, ‘read_only’), joined_at. PK is (user_id, org_id). Each user can belong to multiple orgs theoretically (for future supplier maybe), though primary use is one. Ensure one admin per org minimum.
customers	Customers/clients of the tenant (CRM contacts).	id (UUID PK), org_id (FK organizations), name (text), email, phone, address (JSON or separate fields for street/city), company (if B2B client, optional), created_at, updated_at, is_archived (bool for soft delete). Index on (org_id, name).
orders	Sales orders or jobs recorded in CRM.	id (UUID PK), org_id (FK organizations), customer_id (FK customers), order_number (serial or unique text — could be seq per org for readable order IDs), date (timestamp), status (enum: ‘Pending’, ‘Confirmed’, ‘Shipped’, ‘Completed’, ‘Cancelled’), total_amount (numeric). Also, shipping_ttn (text, Nova Poshta tracking number if shipped), shipping_status (text/latest status), shipping_data (JSON for address, etc.), notes (text). Indexes: (org_id, date), and on customer_id for filtering by customer.
order_items	Line items in an order (if using product catalog).	id (serial PK), order_id (FK orders), product_id (FK products, nullable if free-text item), description (text), quantity (int), price (numeric), line_total (numeric). Note: MVP might allow free-text items; if product_id is null, use description. Index on order_id.
products	Catalog of products/services offered by tenant.	id (UUID PK), org_id (FK organizations), name (text), sku (text unique within org), price (numeric), currency (text or enum, e.g. ‘UAH’), in_stock (int, optional inventory count), is_active (bool). For services, in_stock might be null. Index on org_id.
integrations	Store API keys or config for external integrations.	org_id (PK, also FK organizations), np_api_key (encrypted text for Nova Poshta), smtp_settings (JSON or text), sms_api_key, etc. Each org has at most one row here with all integration creds. (We separate sensitive info from main org table for security and optional encryption).
subscriptions	Subscription and billing info for orgs.	org_id (PK, FK organizations), plan (text or enum), status (active/trial/cancelled), next_billing_date, billing_provider (text, e.g. ‘Paddle’, ‘manual’), external_subscription_id (for reference to Stripe/Paddle), users_limit, modules (JSON or array of enabled module codes), created_at, updated_at. (This helps enforce limits in app logic and know what modules to enable.)
audit_logs planned	Audit trail of key actions (if needed for compliance).	id (serial PK), org_id, user_id, action (text like ‘UPDATE_ORDER_STATUS’), target_type (e.g. ‘order’), target_id, timestamp. This is future; MVP might not have but we leave possibility for compliance and debugging.
supplier_links future	Linking suppliers to products/orgs (for B2B2B).	id (PK), supplier_org_id (org that is supplier), client_org_id (org that uses supplier’s products), product_id (the supplier’s product shared). This is a possible table to manage the marketplace relationships. Not used in MVP, but demonstrates how we could model that many-to-many link.

Notes on Multi-tenancy: Every table that holds tenant-specific data has an org_id foreign key referencing organizations. We will enable Row Level Security (RLS) on those tables. For example, on customers we add a policy: CREATE POLICY org_customer_isolation ON customers USING (org_id = auth.jwt() ->> 'org_id') (pseudo-code, actual Supabase policy uses their functions to get token claims). Similarly for orders, products, etc. This ensures a user can only see data for their org. Additionally, for finer control: on orders we might allow a supplier (if implemented) to see an order if their supplier_org_id matches (that would be a more complex policy joining supplier_links; only needed when that feature comes).

Supabase Auth Integration: Supabase by default has an auth.users table for user accounts. We may use that directly and not duplicate user info in our users table. Alternatively, we create users table and sync. Likely easier: use Supabase auth and only have a profiles or memberships table that ties to auth.uid. We can use Supabase’s built-in function auth.uid() in RLS policies to refer to the current user’s ID. The memberships table is key to check roles in RLS:
	•	We can add a column role in memberships and use a policy e.g.: allow update on orders if auth.uid() has role = ‘admin’ in memberships for that org. Supabase can put the role in JWT as a claim to simplify this check on the application side as well.

Data Relationships:
	•	organizations -> memberships -> users: many-to-many through memberships.
	•	organizations -> customers (one org to many customers).
	•	organizations -> orders (one org to many orders).
	•	customers -> orders (one customer can have many orders). If a customer can belong to only one org, which is true, then each order’s customer is inherently tied to the same org as order (we will enforce order.org_id = customer.org_id in logic).
	•	orders -> order_items (one order, many items).
	•	products -> order_items (one product, many order_items).
	•	organizations -> products (one org, many products).
	•	If supplier feature: organizations (supplier) -> products (supplier’s products). supplier_links linking supplier’s products to client org. Possibly also a supplier_orders table separate from normal orders if they want separate domain, but likely not; the regular orders table could have a type to indicate it’s an inter-org order.

Regulatory fields: We consider personal data storage. Customer’s contact info is personal data. We should store only what’s needed. If storing sensitive data, possibly hash or encrypt it:
	•	We might encrypt fields like customer phone or email at rest if required. Supabase doesn’t automatically encrypt column data, but we could use the PG encryption functions (PGP_sym_encrypt) if needed. For now, not doing so to allow search, but note it for highly sensitive fields.
	•	In Ukraine/EU, storing things like names and contacts is fine with user consent and secure handling as we do.

Example row-level usage: If user U1 from OrgA queries Orders, the RLS will append AND org_id = OrgA automatically. Even if they try to filter by another org_id, they’ll get no results. For additional safety, all queries from the client should also include that org filter (though not strictly needed with RLS). We also ensure the primary keys are UUIDs to avoid guessable sequences (adds security through obscurity for cross-tenant guessing, though RLS already prevents access).

Data Model Extensibility: We have planned for expansion:
	•	The presence of a plan/modules info in subscriptions allows toggling features. E.g., we can have a column or related table for enabled modules (like “inventory”, “supplier_portal”). Our app can check that to show/hide features.
	•	The audit_logs or a similar log table can be added without affecting others.
	•	If we integrate more external systems (say an accounting integration), we can add tables like accounting_exports referencing org and maybe foreign IDs, etc.
	•	For performance, if any queries become heavy (like counting orders per customer), we might add indexes or materialized views. For instance, a mat. view for “customer_order_count” by customer could speed up showing a customer list with their order count. Not needed at small scale but ready to add.

Table for offline sync (maybe): We don’t necessarily need a server table for offline data, since offline data will be stored in the client’s IndexedDB. But for conflict resolution, we could have something like a last_modified timestamp on each record (which we will have via updated_at). This, combined with a client device’s last sync timestamp, can help detect conflicts (if a record was updated on server after client’s last pull and client also updated offline, conflict arises). We might not implement complex conflict resolution in MVP, but the data model’s use of updated_at and perhaps updated_by (user id) on records can assist in future conflict handling UI (“record was updated by X on the server, do you want to override?”).

Compliance-related storage:
	•	We will store user consent or settings if needed (e.g., a table org_settings for things like GDPR contact person, DPA signed, etc.). Possibly not needed now.
	•	If a user requests deletion, we will remove their personal data from users and optionally anonymize their name in customers if needed (or just delete those customers if they were test etc.).

The data model above will be implemented via Supabase migration SQL or using their dashboard to create tables (for MVP speed). It respects 3NF (third normal form) generally to avoid duplication (e.g., customer info not duplicated in orders, just referenced). Some denormalization might appear (like storing order total in orders even though it can be derived from sum of items, but we store for quick query and in case items are not used).

ER Diagram Summary: (Textual)

Organization --< Membership >-- User
Organization --< Customer --< Order --< OrderItem >-- Product (-> Organization)
Organization --< Product
Organization --< Order (directly, with Order linking to Customer and Org)
Organization --< Subscription
(Order -> Customer -> Org consistency enforced)

All relationships are enforceable by foreign keys (with ON DELETE CASCADE or RESTRICT as appropriate). For example, if an organization is deleted (we normally wouldn’t physically delete an org, rather deactivate), we’d cascade delete all their data for compliance. But likely we’ll never truly delete an org without manual admin action and backup.

Initial Example Data:
	•	organizations: OrgA (id=…), plan=‘trial’, etc.
	•	users: User1 (id=…, email), User2…
	•	memberships: (User1, OrgA, role=‘admin’), (User2, OrgA, role=‘manager’)
	•	customers: (C1: “John Doe”, OrgA, phone…, created_at..), (C2: “InTech LLC”, OrgA, …).
	•	orders: (Order1: OrgA, customer=C1, status=‘Pending’, total=100, date=…).
	•	order_items: (Item1: Order1, desc=“Widget A”, qty=2, price=20, line_total=40), (Item2: Order1, desc=“Service X”, qty=1, price=60, total=60).
	•	products: (maybe “Widget A” exists as product with price 20).
	•	Now if OrgB is another tenant, all their customers and orders have OrgB id, completely separate logically.

We will maintain migrations for the schema (possibly using Supabase Migration tool or Prisma if chosen). This documentation suffices as specification for implementing the actual SQL.

7. API Design (Next.js + Supabase)

Our API design encompasses both internal API mechanisms (how the front-end communicates with the back-end within the app) and any external API endpoints we expose or use. Since we use Next.js App Router and Supabase, we have a few layers of API:

7.1 Internal API (App <-> Server Communication):
	•	Next.js Server Actions: For most form submissions and user-triggered operations, we use Server Actions. This means in our React components we define an async function that runs on the server. Example:

// In app/orders/NewOrderForm.tsx
import { createOrder } from '@/server-actions/orders';
...
<form action={createOrder}>
   {/* form fields for order */}
</form>

Here createOrder is a server action defined in server-actions/orders.ts that will receive the form data, then use Supabase SDK to insert an order ￼. After running, it can redirect or return a result. This approach hides the API call from the developer’s perspective (Next takes care of it). It’s secure (only runs on server) and leverages framework.
	•	We will use server actions for: creating/updating/deleting customers, creating orders, updating order status, etc. Essentially, any write operation initiated by the user in the UI.
	•	These actions might call helper functions in our service layer or directly call Supabase. E.g., createOrder might call OrderService.create(...) which wraps the DB calls and any additional logic (like calling NP API if shipping).
	•	Validation of input can be done server-side in these actions (e.g., check required fields, permissions).
	•	On success/failure, the action can either redirect (e.g., go to the new order’s detail page) or throw an error to be caught by error boundary, or return a structured error for client to display.

	•	Supabase Client (Direct queries): In some cases, we might fetch data directly from the database on the client side using Supabase’s JS library. This could be useful for real-time updates or to leverage RLS on the client. For example:
	•	On a dashboard page, we could use a React effect with supabase.from('orders').select('*') to fetch data. But since we prefer server components, most initial data will come via server-side.
	•	Real-time: supabase.channel('orders').on('postgres_changes', ...) to listen for inserts/updates. This is an internal subscription API.
	•	If using this approach, ensure RLS is configured so that the client only gets their org’s data (we will have done that). Supabase client will automatically send the JWT, applying RLS.
	•	Using direct supabase queries in client components might be limited to scenarios where we want background updates without a full page refresh. For MVP, we might not need many – maybe just for something like a live notification count.
	•	Next.js API Routes: We will have some API route endpoints (in app/api/...):
	•	Auth callbacks (if needed): Supabase mostly handles auth via its own endpoints (e.g., magic link callback URL). We might host a redirect page for magic link that calls supabase.auth.exchangeToken() and then redirects internally.
	•	Webhooks:
	•	Payment webhook: e.g., POST /api/webhook/payment – called by Paddle/LiqPay when a payment succeeds. It will verify the signature and then update the subscriptions table for that org (set plan active, etc.). This needs to be an open endpoint (no auth, but secure through secret tokens/validation).
	•	Nova Poshta webhook (if we use it): NP can send updates via webhook instead of us polling. If so, POST /api/webhook/novaposhta could handle incoming status updates. (However, NP might not push by default; likely we have to poll or use their tracking manually.)
	•	These webhook routes should be protected by secret (e.g., a secret token or basic auth known only to the provider, or we verify the payload signature).
	•	Module marketplace API (future open API): Not in MVP, but when implementing an open API for third parties, we’d likely create endpoints under /api/v1/... for resources (customers, orders, etc.). We would then require API keys or OAuth. MVP doesn’t include this, but our internal design with server actions can be extended to API routes easily because underlying service functions are reusable.
	•	For internal use, we might not need a lot of API routes aside from webhooks, because server actions cover interactive use and Supabase covers direct queries.
	•	HTTP Methods and Patterns: We follow RESTful semantics for any API routes:
	•	GET /api/resource – fetch list or item
	•	POST /api/resource – create
	•	PUT/PATCH /api/resource/id – update
	•	DELETE /api/resource/id – delete
	•	However, because many operations are done via server actions, these explicit endpoints might not be separately defined until we decide to expose them publicly. Still, internally, our actions correspond to these operations.
	•	We will ensure idempotency for certain actions: e.g., webhooks might be retried by provider, so our handler should handle duplicate notifications (maybe by checking if we already processed that transaction ID).
	•	Use HTTP status codes appropriately: 200/201 for success, 400 for bad input, 401/403 for auth issues, 500 for server errors, etc. Next API routes allow us to set status and return JSON.
	•	Error Handling:
	•	On the server side, if a server action fails (due to validation, or DB error), we can throw an Error or a custom AppError that we catch in an error boundary. We’ll provide user-friendly messages (in UI’s language).
	•	For API routes (like webhooks), respond with proper code (e.g., 200 on receipt even if we internally fail, maybe log it; or 4xx if we want provider to retry).
	•	Supabase’s errors (like constraint violation) will be caught and handled in our code – we may translate a DB error code to a user message (e.g., if we had unique email constraint, catch that error and respond “Email already exists”).

7.2 Integration with Supabase (as an API):

Supabase provides:
	•	PostgREST: an auto-generated REST API for the database. We technically have this at /rest/v1/... endpoints. We could utilize it for quick data fetches or let the client directly use it. However, to maintain control and apply business logic, we might avoid exposing it directly to clients (except possibly via Supabase JS which uses it under the hood with RLS).
	•	RPC functions: If we create Postgres functions, those can be called via an RPC endpoint. For example, if we have a complex operation, we could implement in SQL and call it. MVP likely doesn’t need that complexity.
	•	We’ll rely more on the SDK or custom Node queries than raw REST endpoints.

7.3 External API Usage:
	•	Nova Poshta API: We’ll wrap calls in a service:
	•	e.g., NovaPoshtaAPI.createShipment(data) which internally does an HTTP POST to NP endpoint (with our API key in header).
	•	NovaPoshtaAPI.getStatus(ttn) for tracking.
	•	These will be called either within server actions (user initiated) or scheduled jobs (background tracking).
	•	The API details (endpoints, request/response format) will be encapsulated so the rest of app just calls the function and handles success/failure.
	•	If NP requires certain security (like IP whitelist or something), ensure our server IP (in target infra) is registered.
	•	Logging: for debugging, we may log NP API errors to an integration_logs table or at least console (so we know if something fails).
	•	Email API: If using an external like SendGrid, similar approach: a service function EmailService.sendOrderConfirmation(orderId) that prepares template and calls SendGrid’s REST API (with our API key).
	•	Or if using SMTP, we might directly use nodemailer in a server action/edge function.
	•	In either case, abstract so swapping later is easy.
	•	SMS API: Possibly integrated later; design similarly.
	•	Payment API (e.g. Paddle): We’ll not collect card info ourselves. The front-end will redirect user to Paddle’s checkout (or embed their widget). After payment, Paddle sends webhook. So:
	•	Possibly an API route /api/payment/checkout that creates an order in Paddle’s system via their API (for a subscription) and returns a checkout URL or payload to the front-end. However, Paddle can be mostly client-side integration too.
	•	We store minimal info – maybe the external sub ID – when we get webhook confirmation.

7.4 API Documentation & Testing:
	•	We will eventually document our API (especially if open to external). Possibly using OpenAPI spec in future. For MVP internal use, not needed.
	•	For internal consistency, we ensure naming is consistent: use snake_case in JSON if needed or camelCase (we have to decide one; often REST APIs use snake, but since we control both ends (Next and DB), and Supabase returns in JSON keys as they are in DB (likely snake_case since SQL), we might use snake_case in DB and then convert to camelCase in React if needed).
	•	Testing: We can use tools like ThunderClient or Postman to test our API routes (like webhooks) by sending sample payloads.
	•	Also, using Supabase’s GUI or psql to test RLS and DB logic to ensure it works as expected with JWT.

7.5 Example API Workflows:
	•	Login Flow:
	•	If user uses email/password: front-end calls supabase.auth.signInWithPassword({email, pass}). Supabase returns session and sets a cookie (if we configured the auth cookie). We then redirect to app.
	•	If using magic link: front-end calls supabase.auth.signInWithOtp({email}). Email sent. When user clicks link, it comes to our app’s callback route (we configured in Supabase). We then call supabase.auth.getSessionFromUrl() (for instance) to finalize login, then redirect. This is a bit out-of-band from typical API, but it’s part of auth flows.
	•	Either way, after login, the Supabase JWT is now present for use in supabase calls, and we may also put it into a Next.js server-side session if needed.
	•	Get customer list (page load):
	•	Next.js server component runs const { data: customers } = await supabase.from('customers').select('*').eq('org_id', orgId) using a Service Role (to bypass RLS on server and filter by org explicitly) or using user JWT (then RLS applies, either way they only get their org). Then renders the page. Alternatively, call our own CustomerService.listCustomers(orgId), which does the same under the hood.
	•	The client gets page HTML with customers data embedded (or via hydration).
	•	Add new customer (via server action):
	•	Action receives form data, calls await supabase.from('customers').insert({...}). Since this is server with service role, we manually add org_id to the object using current user’s org (we know it from context).
	•	Insert returns success or error. On success, maybe redirect to customer list or detail. Meanwhile, Supabase Realtime triggers an event to any listeners on customers table.
	•	If error (like duplicate unique email in that org), action throws and our UI shows an error message.
	•	Update order status (via server action or small API route):
	•	Possibly done via server action when user clicks a button, or via an API PATCH call if we use a fetch from client. Likely server action: await supabase.from('orders').update({status: newStatus}).eq('id', orderId).eq('org_id', orgId). The eq org is for safety; we ensure one row. Or we might use Supabase RPC security definer function for more complex check.
	•	Returns success, we then revalidate or update state (maybe we optimistic update the UI).
	•	Offline data sync API:
	•	When back online, the app needs to send queued operations. We might implement an API route /api/sync to batch send multiple operations in one go (to reduce overhead). For example, the PWA could store all offline actions (like “create customer X”, “create order Y”) and when online do a single POST to /api/sync with array of actions. The server would iterate and apply them (respecting order and consistency). This prevents issues with multiple round trips if network is flaky.
	•	Alternatively, the app can just re-run the server actions for each queued item once online. Since our server actions are idempotent enough (though creating the same order twice is not idempotent inherently), we would need to guard against duplicates (maybe using a client-generated UUID for each new record and check if it exists before insert to not double-create).
	•	We might implement a simple approach: each offline-created record has a temp ID; when syncing, the server either inserts (if not exists) and returns real ID, updating local data. This might be too detailed for MVP, but the API design allows for it if time permits.

7.6 Security & Authorization in API:
	•	All internal calls from the client carry the user’s JWT (Supabase’s library does this automatically for .from() calls). Our Next server actions get user info via either context or by reading the cookie and verifying token.
	•	We will verify user roles in sensitive endpoints: e.g., in a server action for deleting a customer, check if context.user.role === 'admin' or query membership to confirm.
	•	We will not trust any client-supplied org_id or user_id; always derive from JWT. So our APIs ignore or override those fields (prevent confused deputy).
	•	Also ensure an org cannot, for example, create an order for a customer from another org (the form might have a customerId hidden field – server will verify that customerId belongs to current org by a join or the RLS will inherently block it if using user JWT).
	•	Use parameterized queries (Supabase does this to avoid SQL injection).
	•	Rate limiting: Not a big concern for MVP, but if open API comes or to prevent abuse (maybe someone spamming our signup or something), we might use either Supabase’s built-in rate limiting extension or implement simple rate limit (like one could use Upstash Redis with Edge Functions or so). For now, trust the limited scope, but monitor.

In summary, the API design leverages Next.js server capabilities and Supabase’s features to minimize the need for a large custom API surface. It results in less boilerplate (thanks to server actions) and ensures that logic is mostly either in database or in our controlled server environment. Should we open up an API to third-party in future, we will formalize these endpoints (possibly exposing some server actions as REST endpoints with token auth).

8. Subscription & Billing Model

Our monetization approach is a subscription-based model with the flexibility of add-on modules and a white-label offering. Here we detail the pricing plans, feature entitlements, and technical implementation for billing.

8.1 Pricing Plans Structure:

We will offer a tiered subscription model tailored to SMBs, plus optional paid modules:
	•	Free Tier (Trial or Limited) – Optional: We may allow a free-forever plan with limited usage to entice small clients, or at least a time-limited free trial (e.g., 14 days with all features). Free tier will have caps (e.g., max 50 customers or 20 orders) to encourage upgrading.
	•	Basic Plan – A paid subscription that includes core CRM features suitable for a single user or small team. Limits on number of users and possibly number of customer records or orders per month (to control heavy usage on our free infra).
	•	Pro Plan – Higher tier with extended limits and additional features. For example, Pro might allow more users, remove record count limits, and include certain premium modules (like inventory or advanced analytics when they exist). Also priority support possibly.
	•	White-Label/Enterprise Plan – Top tier (likely custom-priced) that allows white-label branding, custom domain, and possibly self-host option or dedicated instance. Also includes all modules and highest limits. This is targeted at larger clients or partners (like a franchise that wants to provide CRM to their network under their brand).

A possible outline of plans and features:

Plan	Monthly Price (indicative)	User & Data Limits	Included Features
Free / Trial	$0 (free) or limited trial period	1 user, up to 100 customers, 50 orders/month, 1GB storage	Core CRM (contacts, orders), Nova Poshta integration (maybe limited usage), basic email (with our branding on outgoing email footers), no custom domain.
Basic	~$20/month (UAH equivalent available)	3 users, 1000 customers, unlimited orders, 5GB storage	Core CRM features, Nova Poshta integration, Email/SMS (pay per use for SMS), basic support via email. No access to premium modules (those can be added separately).
Pro	~$50/month	10 users, 10000 customers, 20GB storage, priority API rate limits	All Basic features + premium modules included (e.g., Inventory management when available, simple analytics), higher Nova Poshta usage (if we enforce limits), priority support (faster response). Possibly multi-language support once available.
Enterprise (White-label)	Custom (e.g., $200+/mo)	Unlimited users (or very high), 100k+ customers, 100GB storage (or on dedicated DB)	All Pro features + White-label branding (custom domain, logo, no mention of our brand), dedicated support agent, ability to request custom features/integrations, optional on-premise deployment for an extra fee.

(Prices are hypothetical for planning; actual pricing will be determined by market research. We also consider offering annual pricing with discount.)

8.2 Paid Modules:

Instead of creating too many plan variants, we allow à la carte modules that can be added to a subscription. This serves specialized needs without bloating base plans:
	•	Examples of modules: Inventory Management, Advanced Analytics Dashboard, Accounting Integration, SMS package, Open API Access, etc.
	•	Each module could have a monthly fee or one-time fee. For instance, “Inventory Module: $10/mo” in addition to base plan.
	•	Technically, in the subscriptions table, we can have a JSON or join table listing modules enabled for that org. The application checks this to enable UI and functionality for those features.
	•	If a module is not purchased, the related UI either is hidden or shows an upgrade prompt.

For MVP, we might not implement actual module purchases, but we design the system to be modular so that adding this later is straightforward. We can seed the modules list with none or just default ones included by plan.

8.3 Billing Cycle & Payments:
	•	Subscriptions will be monthly recurring by default (with possible discounts for annual prepaid).
	•	We will use an external payment gateway that supports recurring billing and is available in Ukraine. As identified:
	•	Paddle is a good choice since it acts as Merchant of Record (handles VAT, international cards) and pays out to us. It’s available to Ukrainian developers (via their business model) ￼.
	•	2Checkout/Verifone is another, or Fondy for local cards. Fondy can do recurring but might require the client to allow charges.
	•	Payoneer could handle receiving payments but not subscriptions itself (though we can use it to withdraw).
	•	Considering ease: Paddle – integration flow: we create Products (plans) in Paddle, use their checkout, get webhooks for subscription create/cancel/etc.
	•	Implementation with Paddle:
	•	We define SKUs in Paddle for Basic, Pro, etc., and for modules maybe as separate “add-ons” or just separate SKUs that can be subscribed in combination.
	•	In our app’s billing settings page, if an admin chooses a plan or module, we integrate Paddle’s checkout (they have a JS SDK or simply redirect to checkout link).
	•	The user completes payment on Paddle (card or PayPal etc.), then Paddle sends a webhook to us (e.g. subscription_created, subscription_payment_succeeded, subscription_cancelled events).
	•	We update our subscriptions table accordingly: set plan, set next_billing_date, mark payment status. For trial, we might create a subscription entry with trial_end date and only require card after trial.
	•	If Paddle is not available, a backup might be Lemon Squeezy (similar concept, not sure about Ukraine support), or manual invoicing for enterprise (just record they paid offline).
	•	We will ensure to handle failed payments: Paddle sends a failed payment webhook, we can email admin to update card, and perhaps give a grace period. If not resolved, auto-downgrade to Free or restrict login.
	•	The subscription status field tracks if active, past_due, cancelled. The system should check this (e.g., if past_due for over X days, maybe restrict creating new data or show warnings).

8.4 Enforcement of Limits:
	•	User count limit: When an admin tries to invite a new user and they’re at the limit, the UI will prevent it and show “Upgrade to add more users.”
	•	Customer or storage limit: If on Free and they hit 100 customers, we either prevent adding more (API returns an error that we catch and show “Limit reached”) or allow but mark as “over limit” and prompt upgrade. For MVP, simplest is to enforce hard limit via application logic or DB constraint (like we could enforce via a trigger that counts records on insert, but that’s heavy; easier to check count in app code before insert).
	•	Module access: The UI checks subscription info from the org context (we’ll load the current org’s plan and modules into a context on login). Features or menu items for which the module is not enabled will either not render or will show a lock icon with tooltip “Available in X module. Contact admin to enable.”
	•	API call limits / Nova Poshta usage: Possibly track usage count in our DB (like number of NP shipments created that month) and if above plan allowance (say Basic plan includes 50 shipments a month, beyond that either block or charge extra). For MVP, likely not implementing usage billing, just fair use. Later, we might have add-on charges or high-tier includes “unlimited shipments”.
	•	White-label specifics: For a white-label client, we’d set a flag or a special plan code. Then:
	•	The UI would use their branding: we’d fetch org.branding and apply their logo and color scheme instead of default.
	•	Possibly host them on custom domain: requires config on our side (like their domain pointing to our server and our server handling it). We can support multiple domain bindings or a generic approach like <org>.ourcrm.com subdomains included in lower plans and custom domain in top plan. Implementation: in our Next app, we can map incoming host to an organization (store custom domain in org table). This is advanced but doable. MVP might skip actual custom domain implementation but have plan for it.
	•	Upgrade/Downgrade logic:
	•	Upgrading is easy (immediate unlock of features).
	•	Downgrading (from Pro to Basic) – we must ensure data still accessible: e.g., if they have 7 users and Basic allows 3, we must decide which users to deactivate or disallow login? That’s tricky. Perhaps we warn that they must remove users before downgrading. Or allow downgrade but lock out the extra users (maybe mark their membership as inactive).
	•	Similarly, if over the customer limit after downgrade, we could keep existing but block adding new until they delete some or upgrade again.
	•	The system should notify them of such conditions on downgrade.
	•	We’ll likely implement a soft approach: we never delete data on downgrade, just restrict new additions or hide beyond-limit data with a message. But for user count, we might have to lock users.

8.5 Technical Implementation Summary:
	•	Billing Provider Integration: Use Paddle/Verifone:
	•	Maintain a subscription_id from provider in our DB, and perhaps last_payment_id for tracking.
	•	Webhook endpoint to update statuses. We will secure it (Paddle signs their webhooks and provides a public key; we verify).
	•	Perhaps a minor delay in applying a plan until webhook received, but we can also provision immediately after checkout success (which we know in client if using their JS). Safer to rely on webhook to be sure.
	•	In-app Billing UI: A page for the admin to:
	•	View current plan, usage vs limits (like “used 800 of 1000 customers”).
	•	Click “Upgrade” or “Manage Subscription.” For Paddle, they have a portal link possibly or we implement upgrades similarly to purchase flow.
	•	Update payment method (likely via the Paddle portal).
	•	Add modules: could be toggles that initiate a purchase flow.
	•	Cancel subscription: possibly allow direct from UI (which triggers a Paddle cancel via API or user directs to send an email – often subscription products allow self-cancel in portal).
	•	Cost handling: Multi-currency might be an issue (UAH vs USD). If our audience is primarily Ukraine, maybe price in UAH for local (via Fondy) and USD for international via Paddle. But this complicates things. Alternatively, price in USD or EUR since those are stable; Ukrainian customers likely can pay in USD with their cards or via global channels. Or we integrate local payment (Fondy) just for UAH. We can postpone that unless necessary, focusing on one currency for simplicity.

8.6 Example Flows:
	•	New customer signup (trial): They register Org, by default get a Free plan or Trial. subscriptions entry: plan=‘Pro’, status=‘trialing’, trial_end date = now+14 days. System flags trial in UI (“X days left”). Supabase could send an email a few days before trial end (maybe we implement via cron job to send “upgrade now” email).
	•	Trial conversion: When trial ends, if no payment, either auto-downgrade to free (with limited functionality) or lock features until they pick a plan. Possibly allow a grace period. For MVP, might not implement trial expiry (we can manually handle it if needed).
	•	Existing user upgrade: Admin goes to billing, selects Pro, goes to Paddle checkout, pays. Paddle webhook arrives:
	•	subscriptions updated to plan=‘Pro’, status=‘active’, next_billing_date = +1 month, etc. Perhaps record seats or usage if needed.
	•	The app (maybe via listening to that update in DB or just next reload) now knows they are Pro and unlocks features.
	•	Module purchase example: They want Inventory module:
	•	If the module is a one-time fee, could just be a one-off payment and we set a flag forever.
	•	If recurring, it could be part of their monthly (some providers allow add-on charges).
	•	Possibly simpler: we treat it as separate subscription or an upgraded plan (like a Pro+Inventory plan).
	•	But to keep modular, might use a separate Paddle “Product” for Inventory monthly and manage it like separate, which complicates billing (multiple subscriptions).
	•	Alternatively, handle modules outside of Paddle for MVP (like manual admin toggling for now).
	•	White-label sales: Likely manually onboarded. They contact us, we set their plan to enterprise in DB, possibly invoice them directly (outside system). We then configure their custom domain etc. This might not be self-service at all in UI initially.

8.7 Cost of Goods & Profitability: (Not required by user but as context)
	•	Payment fees: Paddle takes ~5%. We incorporate that into price choices.
	•	The subscription fees from users will eventually need to cover infrastructure costs (see section 16) once we exceed free tier.
	•	We should ensure higher plans correlate with expected heavier usage that costs more infra (which they pay for).
	•	Modules allow monetizing optional heavy features (e.g., SMS module might basically charge for SMS costs plus margin).

8.8 Compliance (billing):
	•	We must store minimal card info ourselves – actually none; we offload that to payment provider.
	•	We will provide invoices/receipts – Paddle can handle tax and send receipts to customers directly. For local maybe not integrated in MVP.
	•	Align with any laws (like in Ukraine if we have a physical presence, maybe needed to have certain documentation, but since it’s SaaS likely we’ll operate through an EU/US entity for ease).

Summarizing, technical steps to implement billing in MVP:
	1.	Choose provider (e.g. Paddle), set up products (Basic, Pro).
	2.	Add code for Paddle checkout (JS snippet or redirect link).
	3.	Implement /api/webhook/payment route to handle events (subscribe, cancel, payment success, etc.).
	4.	Update DB accordingly.
	5.	Use subscription data throughout app for gating features (middleware or just checks in components).
	6.	Test end-to-end with sandbox.
	7.	(If no time, possibly skip integration in MVP and just allow admin to mark an org’s plan manually, focusing on structure readiness. But our doc suggests implementing it.)

The system is thus ready to monetize from day one, aligning business goals with tech.

9. UX/UI Principles (Mobile-First Design)

Our UX/UI approach centers on mobile-first design, ensuring that the CRM is convenient on smartphones and tablets, while scaling up elegantly to desktop. We also emphasize a clean, intuitive interface given the SMB audience (who may not have formal CRM training). Key principles and practices:
	•	Responsive Design, Mobile-First CSS: We will design layouts for a small screen (e.g. 360px wide) first, then enhance for larger screens. Using Tailwind CSS utilities (which are mobile-first by default) allows easily adjusting styles at breakpoints (sm:, md: prefixes, etc.). This ensures that on a phone, critical information and actions are prioritized (stacked vertically, larger touch targets), whereas on a desktop, we can use the extra space for additional context or multi-column layouts.
	•	Example: The customer list on mobile might be a simple list of names that navigates to detail on tap, whereas on desktop it could be a table with columns for email, phone, last order, etc.
	•	We will define breakpoints (Tailwind default: sm ~640px, md ~768px, etc.) and test at each. The design should “grow” gracefully: no broken layouts or excessive whitespace on large monitors, and no horizontal scrolling on mobile.
	•	ShadCN/UI Component Library: We leverage shadcn/ui (a set of pre-built accessible components styled with Radix UI and Tailwind). This gives us ready-made components like Dialogs, Dropdowns, Navigation Menu, Data Table, Forms, etc., with consistent styling. Benefits:
	•	Consistent look and feel across the app, as they follow a design system (shadcn uses a variant of Radix DS).
	•	Accessibility out of the box (keyboard navigation, ARIA attributes) which we might otherwise miss.
	•	Mobile-friendly components (for example, the Drawer component can be used for mobile menu).
	•	We will customize the theme via Tailwind tokens (like primary color, radius, etc.) to match our branding (initially we might use a neutral theme, but easily can adapt, especially needed for white-label).
	•	Using such a library speeds up development and ensures a modern, polished UI without designing every element from scratch.
	•	Simple & Clean Layout: The UI will avoid clutter. We aim for an “at-a-glance” dashboard where the user can see key info immediately. We will use clear typography (Tailwind’s defaults or our chosen font), sufficient contrast, and a light design (with dark mode available as preference).
	•	We favor flat design with subtle shadows or borders to separate sections (no overly skeuomorphic or heavy elements).
	•	Each page will have a clear primary action (e.g., “Add Customer” button stands out) usually placed prominently (floating button on mobile or top-right on desktop). Supporting actions will be accessible but not distracting (maybe in dropdown or secondary buttons).
	•	We will use icons alongside text to aid quick recognition (like a plus icon on “Add” buttons, a trash icon for delete, etc., via an icon set e.g. Lucide or HeroIcons integrated in shadcn).
	•	White space is not feared: better some breathing room than cramming too much. Tailwind helps manage spacing consistently.
	•	Navigation and Information Architecture:
	•	On mobile: likely a hamburger menu or tab bar for main sections (e.g., Customers, Orders, Settings). Possibly a bottom nav bar with 4-5 icons for quick access, given PWA usage, to mimic mobile app patterns. Or use a drawer menu that slides from the side with options.
	•	On desktop: a sidebar or top navbar with labeled menu items since screen is bigger. We might implement a collapsible sidebar that shows icons and expands on hover or click for names.
	•	We ensure navigation is consistent – same sections accessible regardless of device, maybe just presented differently.
	•	Use breadcrumb or clear headers on subpages so user knows where they are (e.g., when viewing an Order details, show “Orders / Order #1234”).
	•	Search is an important function (like searching customers). We will put a search bar prominently on listing pages. Possibly a global search in the top bar to quickly find a customer or order by name/ID.
	•	Touch-friendly interactions: All clickable elements will be sized for touch (at least ~44px high in CSS for buttons, per Apple’s HIG). Forms will use appropriate input types (tel for phone, email for email, to get the right mobile keyboard).
	•	We incorporate gestures where native (e.g., maybe allow swipe left on an item in mobile to reveal actions like delete, though that’s advanced and not cross-web easily; so maybe not for MVP).
	•	No hover-dependent features for mobile (make sure anything that appears on hover on desktop is accessible by tap on mobile, e.g., use a long-press or a visible toggle).
	•	Offline UX considerations: When offline, the UI should clearly indicate it (maybe an “Offline” badge or a subtle bar at top). Actions that are done offline will be queued, so we might show a small icon on them like a syncing icon. We will provide user feedback, e.g., if they create an order offline, we display it immediately in list (with a special label or color indicating “Pending Sync”) to reassure it’s recorded, and then once synced, update the status.
	•	If the app is offline and user tries an action that cannot be done offline (say sending an email), we disable that button and explain “No connection”.
	•	Use toast notifications for events like “Order will be synced when back online” or “Data synced successfully” to keep user informed.
	•	Consistency & Reuse:
	•	We will define a set of common components (in addition to shadcn) such as PrimaryButton, SecondaryButton, Card, ListItem etc., to reuse and ensure consistency.
	•	Use consistent color coding: e.g., brand color for primary actions, red for destructive (delete), grey for secondary. Tailwind config can define these.
	•	Status indicators: If we show statuses (like Order status), use the same style everywhere (e.g., pill badges: blue for Pending, green for Completed, etc.).
	•	Modal dialogs for confirming deletes or editing items to keep context (especially on mobile, might use full-screen modals for forms).
	•	Internationalization in UI: Initially Ukrainian labels. We will make sure the font and components handle Cyrillic well. Also ensure text can accommodate different lengths (Ukrainian might be longer or shorter than English for same meaning).
	•	We plan for toggling locale so our design will consider that (no hard-coded text in components; use i18n translations, and design flexible enough for e.g. German which might have longer words).
	•	Accessibility: As mentioned, using ShadCN (Radix) ensures good baseline:
	•	Keyboard navigation: We test that you can tab through fields, press Enter or Space on buttons, etc. No keyboard traps.
	•	ARIA: We ensure form inputs have labels, either visually or hidden. Use <label> properly or aria-label for icon-only buttons.
	•	Color contrast: choose Tailwind colors that meet WCAG AA for text on background. (Shadcn’s default theme generally uses accessible contrast).
	•	Provide feedback for screen readers for important alerts (like an aria-live region for form errors or success messages).
	•	Progressive Enhancement: While our app is JS heavy, it should not blank out if JS is slow. Next.js server rendering helps as user gets a server-rendered UI first. We keep as much logic as possible on server side to avoid heavy computation on client. Also, the PWA can cache pages to load quickly after first visit.
	•	We handle loading states gracefully: e.g., skeleton screens or spinners in lists when data is loading/fetching. Avoid showing nothing or raw data loading text.
	•	Examples of UI flows:
	•	Onboarding: When a new user signs up, after login we might show a quick setup guide (maybe a modal or a page wizard: “Add your first customer”, “Create your first order”). This improves initial UX. Possibly use a banner for trial info “You’re on a trial, 10 days left”.
	•	Customer Detail: Show contact info at top, then maybe tabs for “Details | Orders | Notes”. Mobile: these could be section accordions rather than tabs (because narrow screen).
	•	Order Form: Use steps or accordion if many fields (customer info, items, shipment). Mobile: break into expandable sections for easier focus. On desktop could be one page since space allows.
	•	Notification of actions: e.g., after adding a customer, instead of jarringly going to a new page, maybe show a toast “Customer added” and keep them on form in case they want to add another (or redirect to detail if that’s more common).
	•	Error handling: Inline field validation (with red outline and small message under field) for things like required fields. Global errors (like failed to reach server) show a noticeable banner or toast.
	•	Visual Design (branding):
	•	For MVP, maybe use a neutral palette: primary color maybe a blue or teal that conveys trust but also not too corporate. Since Ukrainian market, maybe use a color that resonates locally (though nothing too flag-like unless intended).
	•	White-label plan: architecture allows customizing these easily via CSS variables or Tailwind theme extension. We could let enterprise upload their logo and pick a color, then generate a Tailwind config for them or just store those and apply via CSS custom properties for colors. But MVP not doing fully dynamic theming beyond dark/light.
	•	Dark mode: We will implement dark mode toggle (React Context for theme). ShadCN components support dark mode via data-theme or class switching. We include Tailwind’s dark variant. Good for users who prefer dark or using at night.
	•	Performance on mobile: We will keep bundle size small:
	•	Only import components used (shadcn uses tree-shaking).
	•	Possibly use Next’s dynamic import for heavy charts or maps (though none in MVP).
	•	Use image optimization for any images (like if we have logos, use Next Image for responsive sizes).
	•	PWA caching of static assets means after first load, subsequent loads (even offline) are instant for JS/CSS.
	•	Avoid large tables on mobile: paginate or virtualize if many records.

In summary, our UI aims to be simple, familiar, and efficient. Mobile-first ensures we serve the majority use-case (SMB owners often rely on phone). Desktop experience will not be neglected – it will be enhanced to use the space (e.g., show more columns, maybe a dashboard with charts on desktop that are hidden on mobile for simplicity).

By adhering to these principles, we reduce user friction: the app should “feel easy” like consumer apps, despite being a business tool. This is a competitive advantage in the SMB CRM space where many tools are clunky or desktop-only. We’ll gather feedback early and tweak the UI to ensure it meets the target users’ expectations.

10. Offline-First & PWA Synchronization

Supporting offline-first functionality is a cornerstone for our mobile PWA experience. We design the application such that it can be used with unreliable or no internet, and then synchronize data when connectivity is restored. This involves careful handling on both client (caching & queueing) and server (reconciliation & conflict management). Here’s our approach:

10.1 Enabling Offline Operation (PWA Features):
	•	Service Worker for Caching: We will register a service worker (SW) using Next.js’ PWA guide. The SW will precache critical assets and pages (using a caching strategy like Cache First for static assets, Network First or Stale-While-Revalidate for API data). Specifically:
	•	Cache static files: JS bundles, CSS, images, the web app manifest, etc., so the app shell loads offline.
	•	Cache API responses: e.g., when user fetches customers list or order details, store the JSON response in Cache Storage or IndexedDB. Use an appropriate cache key (including the request URL and maybe user/org as part of key).
	•	We might use a library or utility for this. Next.js doesn’t provide offline out of the box, but there’s next-pwa plugin or workbox that can help. Alternatively, we implement basic caching manually in SW code (listen to fetch events).
	•	We will mark certain routes to pre-cache on install if feasible (like the main page/dashboard, so it loads even on first offline launch after initial use).
	•	Use Cache Strategies:
	•	For GET requests (data fetch): use “Network with Cache fallback” (try network, if offline then serve cache). Also on network response, update the cache for next time ￼.
	•	For POST/PUT (mutations): those we don’t cache as responses, but we will handle via queue (see below).
	•	The manifest will allow “Add to Home Screen”. We will ensure we provide icons of required sizes and a short_name, background color etc. ￼ for a good installable experience.
	•	Data Storage (IndexedDB or LocalStorage):
	•	We’ll use IndexedDB (perhaps via a library like localForage or directly) for structured storage of data when offline. For example, maintain a store of customers and orders that mirrors recent server data. When online and user fetches data, we update IndexedDB. When offline, the app reads from IndexedDB.
	•	Alternatively, we can use Supabase’s offline capabilities if any. Supabase doesn’t natively provide offline sync in JS yet (though in mobile (Flutter) they have something like replication). Likely we implement ourselves.
	•	Zustand or React Context might hold the in-memory state, but we need persistence beyond reload, so IDB is needed.
	•	We design that on app load, if offline, we populate state from IndexedDB caches. If not present, we show a message “No data available offline” (if user never loaded it before).
	•	Keep offline data updated: whenever we fetch from network, also update the local DB.
	•	Queuing Offline Actions:
	•	We will implement a client-side request queue for actions (writes) performed offline. For example, user adds a new order offline:
	•	Our UI should allow it (user fills form, hits save). Instead of sending to server (which fails), we:
	•	Assign a temporary ID (e.g., a negative number or UUID marked as temp).
	•	Save this order in local IndexedDB (so it appears in the list immediately with maybe a status “syncing”).
	•	Push an entry into a “pendingActions” list (could also be in IDB, or localStorage if simple). This entry describes what to do: e.g. {type: 'createOrder', payload: {customerId..., items...}, tempId: ...}.
	•	Possibly reflect in UI with a special highlight.
	•	When connection is restored (we can detect via navigator.onLine event or simply on each new connection attempt):
	•	A sync routine processes the queue. This could be triggered automatically by SW using Background Sync API (if available, SW can register a sync event when back online ￼) or by the app on connectivity regain event.
	•	The sync routine sends each pending action to the server in order. We may use our planned /api/sync endpoint or call the respective server actions individually.
	•	As each is successful, we remove it from queue and update local data with real server response (especially to get real IDs).
	•	If any conflict or error arises, mark that entry as failed and notify user (e.g., if two offline actions conflict, or the server validation fails).
	•	Conflict Resolution:
	•	For MVP, we can implement a simple “last write wins” or “client always wins if offline” strategy due to scope. Most likely conflicts: if two different users edit the same record offline. Rare for MVP, but possible.
	•	We’ll at least detect conflicts: e.g., an order was updated in two places. If our server actions have updated_at timestamp, when syncing we can compare: if the server’s updated_at is newer than our offline copy’s timestamp, that means someone else changed it in the interim. We then have a conflict scenario.
	•	Strategy: either overwrite server with our changes (losing others’ update) or merge intelligently. For simplicity, we might choose to always take the server’s latest in such a case and inform the user that their change couldn’t be applied fully. Alternatively, store the conflict and show user: “Record X was updated by someone else while you were offline. Please review differences.” This might be beyond MVP scope to resolve, so likely stick to last write wins but log it.
	•	For adding new entities, conflict is unlikely (unless a duplicate unique field like same customer email added twice offline by two people—then server would error on duplicate unique. We’ll catch that error in sync and show user a message “Customer with that email already exists.”).
	•	Use the Background Sync API if possible: This allows the service worker to automatically retry sending queued requests when the connection returns, even if the user isn’t actively using the app at that moment ￼. We’ll attempt to use it for non-critical sync (some browsers support it). If not, the app will sync next time user opens it with connectivity.
	•	Partial Functionality Offline:
	•	We identify which features fully work offline:
	•	Viewing previously loaded data: Yes (customers, orders that were cached).
	•	Creating new customers/orders: Yes (queued).
	•	Editing existing: Yes, but potential conflict if others changed too. We’ll still allow and sync later.
	•	Nova Poshta integration: No offline – obviously cannot reach NP API without internet. If user tries to generate a shipment offline, we should block or queue it. Probably better to disallow (since immediate feedback like label printing can’t occur offline).
	•	Sending emails/SMS: No (needs network). We disable those actions offline with tooltip “Connect to internet to send”.
	•	Logging in: If the user isn’t logged in and offline, they cannot login because authentication requires server. However, if they had logged in and the session token is still valid (we store it), they can potentially use offline mode because we have their cached data. We will ensure Supabase’s auth token persistence (it usually persists in localStorage) so the app can consider them logged in offline and allow using cached data. But any action requiring server verification (like hitting any API that uses the token) will wait for connectivity. So essentially offline use is limited to what’s cached for logged in user; new login offline is not possible (we can show a “No connection” at login).
	•	Readiness Indication: We might include an offline page fallback. If user tries to navigate to a page not cached, we intercept in SW and show a generic offline page (like “You are offline. This page isn’t available. Please go to Dashboard which is available.”). Next-pwa or our SW can handle this scenario (the App Shell concept, where core pages always available, other pages maybe not if not cached).
	•	The manifest is configured to allow standalone usage. We set start_url in manifest to something cached (like / or /dashboard) so that launching the app offline opens a page we likely have cached ￼.
	•	Testing offline: We’ll test in dev tools offline mode to ensure:
	•	PWA installation works on Android Chrome (and iOS Safari).
	•	Launching offline loads the app (with last known data).
	•	Creating data offline and then going online syncs properly (with test scenario).
	•	If multiple devices, test conflicts.

10.2 Synchronization Mechanism:

As described, the core is a synchronization queue on the client side and corresponding server endpoints:
	•	On the server, we might implement an endpoint that can take multiple operations. Alternatively, handle item by item.
	•	Possibly utilize Supabase’s capabilities: Supabase Realtime could be used to sync down changes that happened while a client was offline (when they reconnect, they join the realtime channel and get missed events? Actually, Supabase’s realtime doesn’t replay missed events by default; it’s not like Meteor. So we have to do manual fetch of any records updated while offline).
	•	Therefore, when coming back online, aside from processing our queued writes, we should also refresh the data from server to get any updates made by others:
	•	We can keep track of a lastSyncAt timestamp per table. On reconnect, for each table (customers, orders) fetch any records updated after lastSyncAt. Merge those into local cache (updating or adding new ones).
	•	This ensures we catch up with others’ changes. We can do this via API by sending updated_at >= lastSyncAt filter.
	•	After syncing both ways (uploads from queue, downloads of new changes), update lastSyncAt to now.
	•	Atomicity: If multiple actions depend on each other (rare in our case), e.g., create a customer then create an order for that customer offline, our sync must ensure order creation waits until customer is synced and real ID retrieved:
	•	Our queue can preserve order. We can also allow an action to produce a mapping (tempId -> realId) which subsequent actions reference. For instance, order creation referencing a temp customer ID: during sync, after new customer returns real ID, update the pending order action payload with the correct ID before sending.
	•	We’ll implement a simple approach: ensure we queue related ops in correct sequence. The sync will process sequentially.
	•	Storage for queue: likely in localStorage or IndexedDB (to persist if app closed before reconnect).
	•	Possibly use an existing library for offline sync? There are patterns like  PouchDB + CouchDB, but we want to avoid adding heavy dependencies. Our domain is not extremely complex, so custom handling is fine.

10.3 Edge Cases Offline:
	•	If the user closes the app before reconnecting, the pending queue remains. Next time they open (maybe now online), we resume sync. We should ensure the queue persists (so use IDB, not just memory).
	•	If a user accidentally triggers the same action multiple times offline (like tapped “save order” twice), we might have duplicate entries. We can guard by disabling the button after first tap or de-duplicating pending actions (e.g., if two actions are identical or updating same record, maybe merge them).
	•	Large attachments offline: We likely do not handle file uploads offline (like adding a product image offline – we should restrict that because storing a large image in IDB and then syncing might be complicated). If needed, we either block or queue the file to upload later (which SW can do), but for MVP, perhaps avoid offline file uploads.

10.4 Example Sync Scenario:
	1.	User in field (offline) opens app (already logged in before). The service worker serves cached HTML/JS. The app reads cached customers/orders from IDB and displays them. The user creates a new order for an existing cached customer.
	2.	The app generates a temp ID T123 for the order, adds it to local order list (with a small label “Pending”). Queues an action { createOrder, tempId: T123, data: {customerId: C5, items:[...]} }.
	3.	An hour later, connectivity is back. The app (either still open or reopened) detects online. It triggers sync:
	•	It first fetches any updates since last sync: e.g., sees that another user had added a new customer in meantime – fetches that and adds to local DB.
	•	Then processes queue: sends the createOrder for temp T123. The server receives it via API route or server action:
	•	The server creates the order in DB, responds with the new order record (with real id, say 789).
	•	The API response includes mapping T123 -> 789 or our client infers by returning perhaps a clientReference.
	•	Client receives success, replaces the temp entry in order list with the real one (now no “Pending” label).
	•	Removes that queue entry.
	•	Sync complete. UI indicates maybe briefly “All changes synced”.
	4.	If network is spotty, and sync fails halfway, we handle partial: unsynced items remain in queue for next try. Possibly use the Background Sync to keep retrying.

10.5 Libraries and Tools:
	•	Consider using an existing offline sync lib like ServiceWorker Background Sync or the upcoming Periodic Sync API for periodic background sync (some browsers allow SW to periodically wake and sync every few hours).
	•	Perhaps use Dexie.js for easier IndexedDB operations, or a state library that supports persistence (Zustand has middleware for persisting store to localStorage/IDB, which we could use for small things).
	•	Investigate if there’s a Supabase+Next example of offline usage (some community content might exist).

Our solution is custom but straightforward, given MVP scale, which is acceptable. We assume the volume of data is not huge (hundreds or a few thousands of records), so storing them in IDB and syncing is fine performance-wise.

By implementing these measures, the app will fulfill an “offline-first” promise: users can trust that they can use the CRM anywhere, network or not, and their data will catch up later. This can be a strong selling point in areas with unstable internet or for on-site use (e.g., warehouses, field service).

11. Compliance & Legal Considerations

Operating in Ukraine and potentially the EU means we must comply with data protection laws (Ukrainian PDP Law and GDPR), as well as other relevant regulations for a SaaS handling personal data. Below we outline our compliance approach:

11.1 Personal Data Protection (GDPR & Ukrainian Law):
	•	Lawful Basis & Consent: We will establish a lawful basis for processing personal data of end-customers stored in the CRM (most likely “legitimate interest” or “contractual necessity” of our client businesses). Nonetheless, our platform will require our customer (the SMB) to obtain consent from their end-customers if needed (for example, if they plan to send marketing SMS via our system, they should have consent). We will include in our Terms that the business is responsible for the data they input, and they confirm they’ve collected it lawfully.
	•	Privacy Policy: We will draft a clear Privacy Policy in Ukrainian (and English) that explains what data we collect (e.g., business account info, end-customer data), how we use it (providing service, support, analytics), and how it’s stored. It will cover that data might be stored on servers possibly outside Ukraine (Supabase likely EU or US), but always protected and possibly mention that adequate safeguards exist (as Ukraine has no adequacy decision, but we align with GDPR standards).
	•	Data Minimization: We only ask for data that is needed for CRM functionality. For instance, we don’t collect sensitive personal data (like race, religion, etc.) from end-customers – only typical contact details, which avoids a lot of sensitive category issues. We instruct users not to store such sensitive data in free text fields in violation of policy.
	•	Data Security Measures: As described earlier:
	•	Data is transmitted over HTTPS (TLS).
	•	At rest, Supabase’s Postgres is presumably encrypted on disk (most managed services do – we will confirm or enable it if self-hosted).
	•	We will implement access controls: each user can only access their org’s data (enforced by design and RLS).
	•	We ensure personal data is protected from unauthorized access, accidental loss or destruction ￼ by using backups, RLS, and secure coding.
	•	Regularly update dependencies and monitor for vulnerabilities. We might perform occasional security testing (at least code reviews for security).
	•	If a data breach occurs, we have a procedure to notify affected customers and (if under GDPR, the authorities within 72 hours).
	•	User Rights (Data Subjects): Under GDPR/Ukrainian law, individuals (our customers and our customers’ clients whose data is in CRM) have rights:
	•	Right to Access: If a customer asks, we can provide them with an export of their data (we’ll build an export feature in the app for admins to download all their contacts or orders as CSV, satisfying data portability).
	•	Right to Rectification: Users can edit their data in the app. If an end-customer of one of our clients wanted to correct their info, the client can do it via the CRM.
	•	Right to Erasure: If an end-customer requests deletion (and no legal necessity to keep data), our client (the data controller) can delete the record from CRM (we allow deletion of customer entries). If our client (the business) wants to leave our service and have all their data removed, we commit to permanently delete their organization’s data upon request. We might automate account deletion if subscription ends or via support request.
	•	Right to Restrict or Object: Unlikely to apply within the CRM usage scenario, but if an end-customer objects to processing, the business might simply stop using their data (which is outside our system’s control aside from deletion).
	•	We will make sure our system can accommodate these actions (delete means actual deletion or heavy anonymization if needed).
	•	Data Processing Agreement (DPA): As a SaaS provider, we are a Data Processor for our client’s data. We should provide a DPA that clients can sign or accept as part of terms, outlining how we handle personal data on their behalf, our security measures, breach notification process, etc., complying with GDPR Art. 28 requirements. This likely included in our terms or as separate downloadable agreement.
	•	Data Transfer and Storage Location: We need to note where data is stored. If Supabase’s servers for our project are in the EU (we can choose region, likely choose Frankfurt or another EU location to satisfy GDPR concerns), then EU personal data is safe under GDPR adequacy (Ukraine is not EU, but if hosting in EU, it’s fine for EU users; for Ukrainian users, transferring to EU is allowed because Ukraine is party to Convention 108, and under local law, transfers to signatory countries including EEA are considered adequate ￼).
	•	If any data goes to US (for example if Supabase or other providers route through US), we might need SCC (Standard Contractual Clauses) in place. Possibly avoid storing in US if possible to keep it simple.
	•	We’ll disclose to clients that data may be stored in EU or other specified countries. According to Ukrainian law, it’s allowed if adequate protection or consent obtained ￼. We’ll ensure we meet one of conditions, e.g., each user agrees to our terms which include consent to transfer data internationally for service provision.
	•	Data Protection Officer: Likely not mandatory for us at small scale (GDPR DPO needed for large scale sensitive processing; Ukrainian law requires DPO if processing high-risk data ￼ ￼, which we likely don’t, or we can voluntarily assign someone). For now, we can designate one of the founders as responsible for data protection oversight.
	•	Registration/Notification: In Ukraine, data controllers no longer register databases, but they must notify Ombudsman if processing high-risk personal data categories ￼ (like health, etc., which we do not). So we probably don’t need to notify for our use-case. If we did have high-risk, we would send the notification within 30 days as required ￼ ￼.

11.2 Other Legal Considerations:
	•	Terms of Service: We’ll have Terms of Use for our SaaS. Key points:
	•	Users (SMBs) are responsible for the content they input (no illegal data, no uploading someone else’s personal data without right).
	•	Limitation of liability (we provide service as is, not liable for business losses due to downtime etc., beyond maybe refund of fee).
	•	Usage limits and fair use (especially if we have a free tier).
	•	How subscription is managed (billing terms, termination, etc.).
	•	Ukrainian jurisdiction likely for local clients – we specify governing law (maybe Ukraine law for domestic, possibly also mention GDPR compliance).
	•	If servicing EU customers, we might eventually incorporate standard contract terms for GDPR.
	•	GDPR Specific:
	•	We’ll follow principles: purpose limitation (we only use data to provide CRM service, not for other purposes like selling it; no secondary use without consent).
	•	We will honor “Do Not Track” or cookie consent in our marketing site (the app itself might not have third-party trackers, aside from maybe optional analytics).
	•	If we ever implement analytics or error tracking in-app, ensure it’s privacy-compliant (maybe no Google Analytics without consent if used in EU, or use a GDPR-friendly service).
	•	Local Ukrainian nuances:
	•	Ukrainian personal data law enforcement is handled by the Ombudsman’s office. We should be ready to assist any inquiries. The law imposes fines (small ~€700) for non-compliance like unauthorized access incidents ￼. Our security measures aim to prevent that.
	•	Under martial law, some provisions changed (not particularly affecting commercial SaaS, but for e.g. if we had to transfer medical data abroad it was allowed ￼, not directly relevant).
	•	Email/SMS Consent: If we send emails on behalf of our clients, we should ensure those are transactional or if marketing, that the client has consent. Possibly provide an unsubscribe mechanism if we allow bulk emails. This is partly our clients’ responsibility but since it’s through our platform, we should facilitate compliance (like if an end-customer opts out, mark them and do not send).
	•	Data Retention: We will not keep personal data longer than necessary:
	•	If a client leaves, we can delete their data after a grace period (say 60 days) unless they request immediate.
	•	We might implement a data retention policy for end-customer data too if needed (like ability to auto-delete customers not contacted in X years if requested).
	•	Backup confidentiality: Our backups of the DB also contain personal data, so those are stored securely (likely on Supabase side for now, which should be secure).
	•	Cookies/Tracking: Our application will mostly use secure HttpOnly cookies for sessions (Supabase uses localStorage by default, but maybe we use cookies for SSR ease). We might not even need tracking cookies. If our marketing website uses cookies, we’ll show a cookie banner if targeting EU (for now, focusing UA, perhaps less strict but still good to have).
	•	Ombudsman Notification: Since we likely won’t process high-risk categories (like health, religion) ￼, we do not need to notify. If we ever add a module that might (for instance, storing health info – not planned), then we would do the notification and maybe appoint a DPO as required ￼.
	•	Contractual clarity: We’ll have to ensure the customers understand we as provider have access to their data for support (we might rarely need to look at DB to help with an issue). The DPA/Terms will specify what we can do (e.g., we won’t access their data unless necessary for support or legal compliance, and even then minimal).
	•	Payment compliance: Using a provider like Paddle simplifies VAT handling. If selling to EU individuals, we must handle VAT. Paddle as MoR would take care of VAT and tax remittance. If we directly charge Ukrainian businesses in UAH, we might have to deal with local tax (we should likely register as FOP or LLC and do proper accounting).
	•	Ensure our billing is compliant with local tax laws (issue invoices with required details if needed by B2B clients in UA).
	•	Intellectual Property & Licensing: The code and product is ours. But any usage of third-party libs (like shadcn which uses Radix, etc.) are MIT or similar, fine. We just must ensure to attribute if any license requires (most don’t for MIT).
	•	Age restrictions: CRM is business software, but just in case, it’s not meant for children. We might state users must be 18+ or so, though it’s moot as it’s B2B.
	•	Disaster Recovery: From a legal perspective, we should have a plan to not permanently lose data. We’ll use Supabase backups or our own to ensure we can restore data after, say, a major outage, to avoid breach of contract or data loss issues.
	•	Breach Response: If a breach happens affecting personal data, under GDPR we notify authorities (if severe) and data subjects if high risk to them. Under UA law, likely similar obligations via Ombudsman could apply for serious incidents (though not explicitly as strict as GDPR yet, but draft law aligning is in progress).

In essence, we treat GDPR and Ukrainian PDP law as baseline compliance standards. This not only avoids legal penalties but also builds trust with our customers that their data and their clients’ data is safe with us. We’ll document these measures and make compliance an ongoing task (e.g., reviewing practices if laws update, like the new Ukrainian draft law aligning with GDPR expected soon ￼).

12. MVP Scope Definition

It’s crucial to clearly delineate what features and tasks are included in the MVP (Minimum Viable Product) and what is out-of-scope (to be done in future phases). The goal of MVP is to deliver a working product that provides immediate value (customer & order management for SMBs) while meeting the constraints (free tier, limited time) – and nothing more. This section enumerates the MVP scope:

Included in MVP (Must-have Features):
	•	User Management (Basic):
	•	User registration (sign up as a new organization’s admin).
	•	User login (Supabase email/password or magic link).
	•	Simple invite mechanism for one additional user (we’ll allow at least one manager to test multi-user). Full user role management UI can be basic or even SQL-handled if needed; minimal UI to set role.
	•	Password reset via Supabase’s built-in email.
	•	Organization & Role:
	•	Creation of an organization record at signup.
	•	The creator is admin by default. Role enforcement in UI (e.g., non-admin cannot access billing or user invite).
	•	Profile settings page for Org: change org name, upload logo (optional if time, else stub), and view current plan (even if just Free in MVP).
	•	CRM Core (Customers & Orders):
	•	Customers CRUD: Form to add a new customer with name, contact details; List customers table with search by name; Edit customer info; Delete customer (with confirmation). Ensure deletion cascades or prevents if they have orders (maybe just allow deletion if no orders, else require archiving? For MVP, we can allow deletion and optionally also delete their orders or ask user to confirm cascade).
	•	Orders CRUD:
	•	Create Order: a form where user selects a customer (dropdown of existing customers) and enters order details. For MVP, implement a simple item entry: perhaps a single text field for item description and price (to avoid building full multi-line items UI). Alternatively, if we manage product list, allow selecting one or multiple products (but product selection could be extra complexity; maybe skip for MVP and just do manual entry of line items).
	•	We do want to support quantity and multiple items ideally. Possibly use a repeating form group UI (a button “Add item” that clones fields). This is moderate complexity but doable.
	•	Save order, compute total.
	•	View Order: a page or modal that shows order details, including list of items and total, and status.
	•	Update Order: allow changing status (via dropdown or buttons, e.g., mark as Shipped).
	•	List Orders: a page listing orders (with maybe columns: order number, customer name, date, status). Support filtering by status.
	•	Basic sorting by date or search by customer on the orders list (maybe minimal filter).
	•	Cancel/Delete Order: we may allow deleting orders that are in pending state (like if it was mistaken). Completed orders maybe not deletable in UI to preserve history (or allow admin only).
	•	Nova Poshta Integration (Minimal):
	•	A field in Order creation for “Shipment via Nova Poshta: Yes/No”. If yes, allow entering delivery details (city, etc.) or selecting from preset? Possibly simpler: after order creation, an “Generate TTN” button on order view.
	•	On click “Generate TTN”: call Nova Poshta API (we integrate using provided API key). The key could be stored per org; for MVP, we might use one test API key for all (less ideal, but to simplify if needed).
	•	If successful, store TTN in order record and display it. Possibly fetch label URL and display link to label.
	•	We will not implement office address lookup in MVP (user has to input or default to some placeholder).
	•	Tracking: Possibly a button “Track Shipment” that triggers an API call and returns current status text to display. Or just link to NP’s tracking page in a new tab with the TTN.
	•	The integration scenario to test: admin goes to an order, enters NP info (like weight, payer type, etc?), gets TTN – at least verifying connectivity with NP API.
	•	We’ll use Nova Poshta’s sandbox if available to avoid real shipments cost.
	•	Communication Integration (Basic Email):
	•	When an order is marked confirmed or shipped, provide a button “Send Email to Customer”. On click, send a simple email (via some SMTP or SendGrid free) with a generic message (e.g., “Your order {{orderNumber}} has been shipped. Tracking: {{TTN}}”).
	•	Configuration of email sending: for MVP, might hardcode from address or use Supabase SMTP.
	•	Not building full email template editor; just a proof-of-concept automated email.
	•	SMS likely out-of-scope due to needing an SMS API and cost. Possibly just plan it for later.
	•	Mobile-Friendly UI:
	•	Ensure main pages (login, customers list, orders list, forms) are usable on small screen: test on a smartphone dimension.
	•	PWA manifest and basic service worker: at least for “Add to Home Screen” and to load without network errors. Possibly use next-pwa to generate a service worker quickly.
	•	We might not implement full offline queue in MVP if time is short, but at least caching for read (so if you revisit a page it might be available offline).
	•	If possible, implement at least a basic offline create for one entity to demonstrate concept.
	•	But since offline is key requirement, we should aim to implement the queue for at least one scenario (like create order offline).
	•	Subscription/Billing (MVP scope light):
	•	We will have at least two plans: Free and maybe one Paid (for demonstration).
	•	But implementing full payment in MVP might be heavy overhead. Possibly, we skip actual integration with payment gateway in MVP and instead:
	•	Provide a dummy toggle in admin settings to simulate upgrade/downgrade (or manually in DB set plan).
	•	Or integrate a very basic payment flow like using a test Stripe or just mark paid.
	•	However, subscription logic like restricting features can be shown: e.g., free plan: limit 5 customers. Code enforcement of that limit. Paid plan: unlimited.
	•	Possibly implement a Stripe test mode (though Stripe isn’t officially available, for MVP/test we could use it in test mode). Or skip real payments.
	•	The focus is more on structure: plan awareness in system. So MVP: display current plan, and maybe a fake “Upgrade” button that just switches plan in DB with no payment just for demonstration.
	•	The actual payment integration can be left for post-MVP as long as architecture allows it. We’ll specify that as out-of-scope to implement fully now.
	•	Compliance & Settings:
	•	Provide at least a link to Privacy Policy and Terms in the app or signup.
	•	Perhaps an Account Settings where admin can request “Delete My Account” (just as a flag or manual process for now).
	•	Ensure the data export can be done (MVP might not have a polished export UI, but at least we can do CSV export of customers if trivial to implement using a library or simple loop).
	•	Logging or audit might be minimal (maybe track last login time).
	•	Infrastructure/DevOps for MVP:
	•	Use Vercel Free for hosting Next.js (set up project).
	•	Use Supabase Free for DB (setup project in region like EU).
	•	Set up Supabase Auth (enable email auth, configure SMTP).
	•	Implement Supabase Edge Function for scheduled job if doing any (maybe track shipments daily or clear old trials).
	•	Cron: maybe just test a scheduled function call (if possible within free).
	•	Domain: possibly use the default domain from Vercel (.vercel.app) for MVP. Custom domain if easy, but not necessary at this point.
	•	Monitoring: minimal (we rely on Vercel/Supabase consoles).

Excluded from MVP (Planned for Future, not implemented now):
	•	Supplier Portal (B2B2B): No functionality for suppliers to log in or share catalogs. All multi-org interactions out-of-scope. (We might still structure data in anticipation, but nothing in UI).
	•	Advanced Modules: Inventory management (stock tracking), analytics dashboards with charts, accounting integrations – none of these will be in MVP aside from maybe a placeholder if needed.
	•	Marketplace / Open API: Not in MVP. We won’t provide API keys or external developer docs yet.
	•	Multi-language UI: Will stick to Ukrainian only in MVP (with static text possibly just written in Ukrainian in the code or lightly using i18n library but with one locale).
	•	White-label customization: No custom domain or theming per org in MVP. We’ll use one global theme. Possibly include the organization’s name/logo in UI as identity, but not extensive branding.
	•	Full offline sync and conflict handling: If pressed for time, the offline capability might be basic caching and maybe new items queue without conflict resolution. The full robust background sync might be iterative. But we will try to implement core parts as possible, since it’s specifically requested.
	•	Performance optimization at large scale: MVP will handle modest data. We won’t implement heavy caching or partitioning beyond what’s needed for our free-tier limits. E.g., we won’t implement Redis caching in MVP (that’s for migration stage).
	•	Automated testing & CI pipelines: MVP development might rely on manual testing. Setting up full test suites or CI is good practice but can be trimmed if timeline is short. We’ll do basic unit tests if possible for critical logic but likely skip extensive test harness in MVP scope.
	•	Polished UI for all edge cases: MVP UI might be functional but not pixel-perfect or covering every minor case. For example, we might not implement a loading spinner on every button, as long as the action goes through. Or user profile picture upload not done.
	•	Support system: No integrated help chat or detailed logs UI for admin. That can come later (e.g., an admin panel for our staff to see usage metrics or manage customers).
	•	Scalability beyond free tier: We won’t deploy multiple server instances or any Kubernetes. Single Vercel instance and one Supabase is fine for MVP user counts (couple of test companies).
	•	Payment Integration Real: As noted, possibly stubbed. The actual transaction processing likely left for post-MVP unless it’s straightforward to integrate a test mode.
	•	Legal fine print ready: We will prepare at least basic Terms/Privacy, but maybe not lawyer-vetted final documents for MVP demonstration. (We will be mindful of compliance though in design).
	•	Notifications: In-app notifications or push notifications (web push) are out-of-scope for MVP. Possibly an email is used as a stand-in for notification.
	•	Complex user permissions: Only the roles described (admin, manager, etc.). We won’t implement e.g. field-level permissions or custom roles in MVP.
	•	Multi-tenancy beyond separation: We are doing multi-tenant but in one database. MVP won’t include ability for a user to belong to multiple orgs easily in UI (though our membership schema supports it). We assume one account = one org mostly in UI to keep it simple (except maybe supplier future).

MVP Quality considerations:
We ensure the MVP is usable and stable in its scope. We will do a round of testing the main user flows:
	•	Add customers, add orders, mark shipped, generate TTN, simulate offline use and sync, etc., to confirm things work.
	•	If something outside scope is partially built (e.g., we put a button for a feature not fully working), we hide or disable it to avoid confusion.

By strictly adhering to this scope, we focus development on the essentials: a functional CRM with offline capability and a taste of integration, delivered quickly and within free-tier constraints. Enhancements and additional features will be tackled in subsequent iterations based on user feedback and scaling needs (captured in the roadmap and migration plan).

13. Risks & Edge Cases

Identifying potential risks and edge cases helps us prepare mitigation strategies and avoid surprises during development and deployment. Below we list notable risks and edge cases along with how we plan to handle them:

Risk / Edge Case	Mitigation / Handling Strategy
Free Tier Limits Exceeded: Our usage might exceed free tier quotas (DB rows, bandwidth, function calls) if user base grows faster than expected or if a bug causes excessive calls. For instance, storing large images could eat the 1GB storage, or heavy real-time usage might hit message limits.	- Monitoring: Use Supabase and Vercel dashboards to watch usage (especially DB size and function invocation counts). - Optimization: Ensure efficient queries and minimal payloads (e.g., paginate lists to limit data sent). Implement basic rate limiting on operations if needed (to prevent spam adds). - Graceful Degradation: If nearing limits (like DB size), the app can alert us or temporarily disable non-essential features (like file uploads) and prompt for upgrade (or migration earlier). - Upgrade Plan: Have contingency to upgrade to Supabase Pro ($25/mo) on short notice if absolutely needed, or purge test data. Since MVP user count is small, likely safe.
Supabase or Vercel downtime / cold starts: Being on free tier, functions might cold start causing slow response occasionally. Also, free projects can pause if inactive. If our app goes idle (like no requests overnight), first request in morning might be slow, or worst-case Supabase might hibernate it after a week of no use.	- Keep-alive Ping: Implement a cron job or external uptime monitor to periodically hit the app and DB (to avoid long inactivity). - User Messaging: If an operation is taking long (first cold start), show a loading indicator so user knows to wait, not assume it’s broken. - Caching: Service worker caches content to mitigate perceived downtime (the app could load some data from cache even if backend is waking up). - In case of actual outage, display a user-friendly error page: “Service is temporarily unavailable. Please try again later.” This ensures we fail gracefully rather than blank screen.
Offline Data Conflicts: Two team members make changes offline to the same record (e.g., both edit Customer A’s phone number differently). When syncing, last write wins could override one change without notice. Or one offline and one online change conflict.	- Conflict Flagging: Implement a basic check: when syncing an update, compare server’s last update timestamp with the one the client had offline. If mismatch, we have a conflict. For MVP, we might choose one to apply (likely the latest one or the online one) and log a conflict. In future, we’d notify user of conflict. - To minimize, we might restrict certain operations offline: e.g., maybe editing existing data offline is discouraged in UI (we can allow view + create offline, and only allow edits when online as a trade-off if needed). - Provide an audit log entry if an offline update overwrote a field that was changed by someone else, so at least record exists. (Full resolution UI likely post-MVP).
Data Consistency & Sync Errors: A queued action might fail on sync (e.g., creating order offline but when syncing, the customer ID is invalid because that customer was deleted or changed by someone else in the meantime).	- Implement robust error handling in sync process:   • If create fails due to missing foreign key (customer deleted), mark that sync item as failed and inform user: “Order for deleted customer could not be saved.” Allow user to either discard it or reassign to a different customer.   • Use foreign key constraints to catch such issues early. Maybe disallow deleting a customer if there’s a pending order offline referencing them – hard to detect, but maybe we can if device is online by checking pending queue on that device (not feasible globally). - If any sync item fails, do not drop it silently: keep it in queue with an error state for user to resolve (edit and retry or delete).
Security Breach (Data Leak or Unauthorized Access): Multi-tenancy risk that a bug in RLS or API could let one tenant access another’s data. Or some admin credentials leaked. Also, injection attacks or XSS if not careful, could expose data.	- Thorough Testing of RLS: We will test that using Supabase client as a normal user cannot access others’ data (attempt to tweak IDs in queries). RLS policies will be double-checked. - Least Privilege: Use row-level security and restrict service role key usage to server only. Client uses user JWT always. - Input Sanitization: Use parameterized queries (Supabase does), and validate inputs in server actions to avoid any injection or malicious content. - XSS Prevention: No rendering of raw HTML from users in our app (only plain text fields). Escape any dynamic text. ShadCN components help by default. - Secrets Management: API keys (e.g. NP API) stored in Supabase secure config or Vercel env vars, not in client code. - Monitoring: Although MVP, we should log any suspicious activities if possible (like sudden spike in data access). Supabase might log IPs of requests; we can review if needed after incidents. - Plan for Breach: If something happens, we can quickly rotate secrets (change API keys, invalidate user sessions by resetting JWT secret on Supabase forcing re-login), and follow notification obligations.
Regulatory Non-compliance: Perhaps we fail to comply fully with GDPR/PDP requirements – e.g., user deletion doesn’t actually remove data from backups, or we didn’t obtain necessary consents for sending emails/SMS via the system.	- For MVP, we minimize these exposures:   • Don’t implement unnecessary tracking or data use beyond core functions.   • Document our compliance steps (which we have).   • If any user asks for data removal, we can manually ensure backups are also purged (or have backups encrypted with separate key for quick selective deletion).   • Use double opt-in for any mass messaging: maybe for MVP, only transactional emails, so consent is implicit. For any marketing uses, ensure there’s opt-out (can do a simple “don’t send me emails” flag per customer if needed). - We will create a checklist to verify before release: privacy policy link present, deletion works, etc.
Integration Failures (Nova Poshta, Email API): External APIs might be down or return errors. Nova Poshta might change their API. Or we hit their usage limits (if any). Or our single NP API key might be blocked for heavy use.	- Ensure our code handles API errors gracefully: e.g., if TTN generation fails (network or NP service down), show an error to user “Could not connect to Nova Poshta, please try later” and keep order in system unshipped. Allow retry. - Possibly implement a fallback: if NP API fails, user can still mark order as shipped and manually input a TTN if they got it externally. So the business isn’t blocked. - Keep the integration somewhat decoupled: if NP is down, rest of CRM still works (just that feature doesn’t). - Monitor NP responses; maybe log errors. If an API changes, we’ll update our integration promptly (subscribe to NP dev news if possible). - For email/SMS: if email fails (like SendGrid API down), catch and inform user “Email not sent.” They can retry. It’s not critical to core function (they can use their email client in worst case). - In MVP testing, we’ll simulate an NP failure scenario to ensure it doesn’t break the whole app.
Data Migration/Scaling Issues on Transition: While not immediate in MVP, if we collect data and later need to migrate to our own DB, risk of downtime or data loss. This is more future, but should note.	- Mitigation is in Migration Plan: we will do a careful backup and restore, likely schedule maintenance window. For MVP data (small scale), migration is easier. - To minimize downtime, we might use Supabase’s ability to replicate data to a new Postgres in future or at least do it in off-hours. - Also, ensure our code is not tied to supabase-specific features too deeply; that mitigates risk of being stuck. So far, our design can move to standard Postgres fairly easily (with alternative auth).
UI/UX Edge Cases: Some UI flows might confuse users: e.g., offline indicator might not be obvious and user might not realize data is stale or not synced. Or if they have too many records, our lists might become slow/paginate poorly.	- We’ll refine UX for offline: for example, show a small “Offline Mode” banner when offline. Also maybe mark unsynced records with an icon. Clear feedback reduces confusion. - If lots of records: we plan pagination/infinite scroll when above certain count (maybe not needed in MVP, but likely in future when beyond a couple hundred items). We can test with dummy 500 customers to see performance and implement simple pagination if needed (Supabase can do limit/offset). - Ensure form validation covers edge inputs (e.g., extremely long names, or special characters) so UI doesn’t break. Use proper text wrapping for overflow. - Cross-browser testing: at least Chrome and Safari mobile. Edge case: Safari PWA might handle some things differently (like indexDB quotas or background sync not supported). We’ll test basic functions on iOS Safari as PWA.
Misuse or Unexpected Use Cases: Users might try things like creating two accounts for same business and wanting to merge, or using the CRM in a way not intended (like storing huge file attachments in notes field).	- Our MVP scope might not cover merging accounts or advanced data operations. For such requests, we handle manually (e.g., there’s no merge feature, user would have to re-enter data; we note it as future improvement). - For storing files, we will either restrict file attachments in notes (not implemented in MVP) or set a size limit clearly. If someone tries to paste a base64 image into a text field, we should strip or reject it. - We will provide usage guidelines in help docs. If misuse happens, we can intervene support-wise. - Over time, we’ll add constraints (like file size checks, etc.).
Project/Timeline Risk: Perhaps implementing all planned MVP features in time is challenging, particularly offline sync or NP integration complexity.	- We will prioritize core must-haves (customer/order CRUD) first. If time runs short, some features may be simplified or deferred: e.g., offline may be partial (read caching but not full offline editing), or NP integration might only generate TTN but not fully handle every option. - This is a management risk: we will do iterative development and continuously have a working subset. So in worst case, MVP still does primary job (CRM) and we clearly mark which ambitious features are beta or coming soon. - Also ensure testing time is allocated to avoid an unstable MVP. - If needed, reduce scope gracefully rather than deliver broken functionality.

By anticipating these issues, we can incorporate solutions or at least plans for them proactively. Regular testing (including simulating offline mode, multi-user scenarios, etc.) and having manual fallback procedures (like contacting support) can mitigate a lot of risk in the early stage. Moreover, transparent communication with users (for instance, showing when data was last synced, or if something requires internet) will turn many edge cases into non-issues from user perspective.

14. Development Roadmap

To implement this project, we break down the development into phases with an estimated sequence. The roadmap will guide us from MVP development to future enhancements. Each phase includes key tasks and milestones:

Phase 0: Project Setup (Week 0)
	•	Development Environment: Set up repository (e.g., on GitHub), configure Next.js 16 project with TypeScript. Add required libraries (shadcn/ui components, Zustand, Supabase JS).
	•	Supabase Initialization: Create a Supabase project, set up database schema (using SQL scripts or Supabase Studio) for core tables (organizations, users/memberships, customers, orders, etc.). Enable Auth (email/password).
	•	Integrations Keys: Obtain Nova Poshta API test key, configure any email service credentials (like SendGrid test API key). Store them in environment variables.
	•	Define Code Architecture: Scaffold feature folders (e.g., features/customers, features/orders) and shared components directory. Apply FSD structure baseline.
	•	CI/CD: (Optional for MVP) set up Vercel project connected to repo for continuous deployment on push. Ensure environment variables are set on Vercel (Supabase URL/key, etc).

Phase 1: Core Functional Development (Weeks 1-2)
Focus: User accounts, Customer management, Orders basic.
	•	User Auth & Org: Implement signup page (with email & password -> call Supabase). Post-signup, create org and membership in DB via a Supabase trigger or in the backend. Implement login page. After login, fetch and store user & org context (maybe in Zustand or context).
	•	Basic Layout & Navigation: Create a main layout with header/sidebar. Put placeholders for “Customers”, “Orders”, “Settings”. Ensure it’s responsive (use a mobile menu vs desktop sidebar).
	•	Customers Module:
	•	Create page to list customers (fetch from supabase, display name/contact).
	•	New Customer form (maybe a modal or separate page) -> on submit, call server action to insert into DB.
	•	Edit and Delete: implement either inline edit or a detail page with edit form. Deletion with confirmation.
	•	Test RLS: ensure logged user only sees their org’s customers.
	•	Orders Module (Part 1):
	•	Create an Order list page (just a table with some dummy data first).
	•	New Order form: allow selecting a customer (dropdown listing customers), input basic fields (maybe one text “Item” and “Amount” for now).
	•	Save to DB (server action or direct insert).
	•	Display newly created order in list.
	•	Implement status field (default “Pending”). Possibly allow updating status via a simple action (like a “Mark as Confirmed” button on pending orders).
	•	UI Components: Use shadcn components for form inputs, buttons, modals. Configure Tailwind theme if needed. Ensure mobile views of forms and lists are okay (test manually).
	•	State Management: Introduce Zustand store for maybe caching the customer list so it doesn’t refetch every navigation (optional optimization) or for offline queue placeholder.

Milestone: Able to create account, add customers and orders, see them listed. Basic navigation flows done. This covers the heart of CRM.

Phase 2: Integrations & Offline (Weeks 3-4)
Focus: Nova Poshta integration, PWA offline support, subscription gating.
	•	Nova Poshta Integration:
	•	Add fields to Order form for shipment details (or a separate step after creation). Possibly simplest: after order creation, on Order detail view add a “Generate Nova Poshta TTN” button.
	•	Implement server action or API route that calls NP API with needed info (for MVP, could use dummy data for weight, etc., if not provided).
	•	Parse response, save TTN to order. Display TTN on order detail.
	•	Implement “Track” button: call NP tracking endpoint, show result in UI (either alert or on detail page).
	•	Handle errors (e.g., invalid city).
	•	Test with NP’s sandbox or actual API with test tracking numbers.
	•	Email Notification:
	•	Setup a simple function to send email on certain event (e.g., when order status marked “Shipped”, trigger email to customer’s email if provided).
	•	Use an SMTP or SendGrid free. Maybe integrate an Edge Function or just use NodeMailer in a server action (less ideal on serverless due to cold start but okay small volume).
	•	Test that email is received (maybe to a test address).
	•	Offline Capability Implementation:
	•	Implement service worker caching. Possibly use next-pwa which can generate a SW based on our config (we specify to cache certain routes).
	•	Or manually write a service worker in public/sw.js and register it. Cache static files and GET requests.
	•	Implement IndexedDB via a small wrapper: when fetching customers/orders from DB, also store them in IDB.
	•	On app load, if offline (check navigator.onLine), load from IDB instead of fetch.
	•	Implement offline queue: e.g., create a useSyncStore with Zustand that holds pending actions. When an action (like create order) is triggered:
	•	If online: perform normally.
	•	If offline: push action to queue and update UI optimistically.
	•	Implement a listener for online event: when back online, run sync: iterate queue, call APIs, handle responses.
	•	This is complex; we might aim to at least handle the create new records offline case for MVP. Editing offline maybe skip if time short.
	•	Use localStorage or IDB to persist queue if app closes.
	•	Test by shutting off network: add customer offline, reconnect, see it appear in DB.
	•	Mark unsynced data in UI (maybe italic or a small icon).
	•	Subscription & Plans:
	•	Add a field in organizations for plan (already in model).
	•	Set default “Free”.
	•	Implement in Settings page: show current plan. Perhaps have a dummy upgrade button that sets plan to “Pro” (simulate upgrade).
	•	Enforce one limit, e.g., Free plan max 5 customers. If user tries to add 6th, block with message “Upgrade to add more customers.”
	•	(This demonstrates subscription gating, even if we don’t have payment.)
	•	If feasible, integrate a payment link: e.g., integrate Paddle sandbox or just state “Contact us to upgrade”.
	•	Polish & UX:
	•	Add loading spinners or disabled states for actions that call server (to avoid duplicate submissions).
	•	Use toasts (shadcn has Toast component perhaps) for success/error messages globally.
	•	Responsive CSS tweaks after testing on various screen widths.
	•	Add dark mode toggle and ensure basic compatibility (nice-to-have).
	•	Write a minimal help page or tooltips for unclear things (like “Nova Poshta TTN will generate a shipping label”).

Milestone: MVP feature-complete – offline creation works, NP integration works on a basic level, and the app is installable as PWA. At this stage, all acceptance criteria of MVP are met in some form.

Phase 3: Testing & Refinement (Week 5)
	•	Comprehensive Testing:
	•	Test all user flows: sign up, add data, log out/in, offline usage, etc. on multiple devices (Chrome, Firefox, Safari, mobile Chrome, iPhone Safari PWA).
	•	Fix any critical bugs or UI breaks found.
	•	Security test: try to access unauthorized data (modify REST calls manually to see if RLS holds up).
	•	Performance test with sample data (e.g., insert 100 customers and see list performance).
	•	Edge Case Handling:
	•	Validate forms thoroughly (no empty required fields, proper email format).
	•	Check behavior on expired session (if token expires, ensure user is redirected to login or re-authenticated).
	•	Simulate slow network (in dev tools) to ensure user feedback exists (like loading spinners).
	•	Compliance Check:
	•	Ensure Privacy Policy link is accessible (maybe in footer of login).
	•	Try a data export (maybe via a direct DB query for now, or simple download button for customers list).
	•	Ensure user can delete a customer and that data is gone.
	•	Remove any test data or POC shortcuts (like test upgrade button might remain but clearly labeled).
	•	Prepare Deployment:
	•	Deploy the latest version to Vercel (if not auto).
	•	Set up any environment config needed for production (like real API keys if we used dummy in dev).
	•	Run DB migrations on Supabase to final state (maybe done gradually during dev).
	•	Finalize environment variables (e.g., ensure the service worker registration is correct for production base path).
	•	Documentation & Handover:
	•	Write basic user guide (even as Markdown or in-app hints) for pilot users: how to use offline, etc.
	•	Technical documentation (for internal): summarizing how to run dev, how to deploy, how the queue works (for future devs).
	•	Double-check all citations and attributions if any needed (like licenses).

Milestone: MVP ready for launch. At end of Phase 3, we have a solid MVP deployed.

Phase 4: Post-MVP Enhancements (Future Roadmap)
(These are beyond MVP, listed for context of future development, not executed now.)
	•	UX improvements & Feedback iteration: Collect feedback from initial users to improve UI/UX. Possibly add features like bulk import, search improvements, etc.
	•	Extend Modules: Implement Inventory module, Supplier portal as next priorities if demand, using base we built.
	•	Scalability Upgrades: When user count grows, plan migration to own server (Phase 5 in migration plan).
	•	Mobile App wrapper: Possibly create a Capacitior/Cordova wrapper or simply prompt PWA usage more if needed.
	•	Marketing Website: Build a marketing site and onboarding funnel once ready to scale out of pilot.
	•	Compliance Audits: If planning to serve EU widely, maybe get legal review of our policies, possibly register with data protection authorities as needed.

Each phase above is roughly sequential, but some tasks can overlap (e.g., integration work and offline can be in parallel since different areas). The timeline (5 weeks for MVP) is just a guess; actual might vary.

We prioritize delivering a usable MVP first (Phase 1 and 2 tasks are core). If offline or NP integration proves too time-consuming, those can be reduced in complexity or flagged as “Beta” in MVP.

The roadmap ensures that we have a clear path: build fundamentals, then add differentiators (offline, local integration), then polish. This approach helps to always have a working product at each step that could be demoed if needed (even if missing some advanced features until final).

15. Migration Plan (MVP to Scaled VPS)

As the product grows beyond MVP, we anticipate moving from the initial free-tier, serverless architecture to a more scalable, self-hosted (or dedicated) infrastructure. The migration plan ensures a smooth transition with minimal refactoring. Key components to migrate are: the database, authentication system, hosting environment, and introducing new infrastructure (Redis, RabbitMQ, etc.). Below are the steps and considerations for this migration:

Step 1: Prepare Self-Hosted Environment (Docker/VPS Setup)
	•	Select Hosting: Choose a VPS provider or cloud (AWS, DigitalOcean, etc.) and provision a server (or cluster). For a start, a single VM with sufficient resources (say 4 CPU, 8GB RAM) can host all services via Docker Compose.
	•	Containerize the App: Create a Dockerfile for the Next.js application. We can base on Node 18 image, install dependencies, build the Next app (output .next), then run next start for production serving. Ensure environment variables for connecting to new DB, etc., are accounted for.
	•	Set up Postgres: Launch a Postgres container (or install Postgres on host). Configure with the same schema as Supabase (we can use Supabase’s pg_dump or their migration tools to replicate schema and data).
	•	Enable required extensions: e.g., pgcrypto for UUID generation, pgjwt if using JWT auth, pgmq if we use their queue, pg_cron for scheduling.
	•	Import initial data from Supabase: either use pg_dump backup from Supabase and restore into new Postgres or use Supabase’s migration tool if available. Test that data and schema match (especially RLS policies are in place).
	•	Set up Redis: Launch a Redis (for caching and pub/sub). It will initially not be used by app, but we include it for sessions or caching later.
	•	Set up RabbitMQ/NATS: Launch a RabbitMQ container for messaging. Initially not used by app code in MVP, but we’ll integrate later for background jobs.
	•	Environment Config: Prepare .env for the app to point to new services (DB connection string to Postgres container, Redis URL, etc.). Also include service secrets (like NP API key, email creds, JWT secret for auth).
	•	Testing the environment: Before switching traffic, test locally or on that server: run the Next container connected to new Postgres with a copy of data. Run through basic app flows to ensure nothing breaks (particularly check authentication, as Supabase Auth won’t be there exactly in same way – see next steps for auth).

Step 2: Migrate Authentication
Supabase’s auth needs to be replaced or replicated:
	•	Option A: Self-host Supabase Auth (GoTrue): We can run the GoTrue server (Supabase’s open-source auth service) connected to our Postgres. This would allow existing password hashes and tokens to remain valid if configured correctly.
	•	Set up GoTrue with same JWT secret and settings as Supabase used. The auth.users table and others are in the database dump from Supabase, so all user credentials are there.
	•	If successful, our Next app can use GoTrue endpoints for login (which is same API as Supabase’s JS expects).
	•	This is complex but keeps user accounts seamless.
	•	Option B: Switch to NextAuth or custom auth:
	•	Import users from Supabase: we have emails and hashed passwords (likely bcrypt) in auth.users. We can create our own users table from memberships and have passwords.
	•	Use NextAuth or a simple custom auth flow (e.g., Node using bcrypt to verify password and issuing a JWT/cookie).
	•	Downside: users might need to reset passwords if hashing scheme or salt usage differs (we ensure to use same algorithm if possible).
	•	Given our migration aim of not forcing user actions, we lean to replicating current mechanism as closely as possible.
	•	We’ll pick an approach and test it with one user. Possibly in migration downtime, require all users to reset password (send them a link) – not ideal but an option if easier than migrating hashes.
	•	We also generate new JWTs from our system. We ensure that RLS (if still used) either is disabled (we might drop RLS if our app enforces auth instead, or we keep using RLS by issuing similar JWT with org claim).
	•	If self-hosting Postgres, we can continue to use RLS by issuing a JWT with same claim structure and using PostgREST or our own mechanism. Alternatively, since now Next app can query DB directly, we may drop RLS and handle auth logic in queries (less robust, but easier if JWT integration is tricky).
	•	Safer: Keep RLS, but then our Node server would need to set role and jwt.claims on connection. We could also use a simpler approach: each query includes org_id filter from session context, and run as a DB role that bypasses RLS.
	•	We will thoroughly test auth after this change: login, signup (if still allow), etc.

Step 3: Deploy Next.js on Server & Switch DNS
	•	Once the new stack is ready and tested in isolation, schedule a cut-over:
	•	Announce a short maintenance window or choose off-peak time.
	•	Freeze data on current Supabase: maybe disable writes or put site in read-only mode briefly to avoid divergence during cutover.
	•	Take final DB snapshot from Supabase and import into new Postgres (to catch any data changes since initial migration testing).
	•	Update environment on new server with that final data.
	•	Start the Next.js app container connected to the new DB.
	•	Update DNS or routing: if using a custom domain, point it to new server IP. If using Vercel default domain for MVP, we might switch to custom domain now controlled by us. Or use a reverse proxy that forwards traffic to new server instead of Vercel.
	•	Alternatively, we could initially run new stack behind same URL by taking Vercel down and using our server at same domain. For that, the domain’s DNS should move from Vercel to our server’s IP (with proper TLS).
	•	Ensure TLS: setup Nginx or Caddy on the server for SSL with Let’s Encrypt for our domain.
	•	When DNS propagates (could be immediate if we planned or a short TTL), traffic starts hitting new server.
	•	Monitor logs closely for any errors (especially any SQL errors, auth failures, etc.).
	•	Keep the old environment running but quiescent in case rollback is needed.
	•	If something goes wrong majorly, we can quickly point DNS back to Vercel/Supabase and only minimal data (if any created in new system during test) would need merging.

Step 4: Post-Migration Enhancements
Once running on VPS, we can gradually utilize the new infra:
	•	Implement Redis caching: Identify frequently accessed data (e.g., reference lists). Integrate Redis in our Next app: e.g., before querying Postgres for customers, check Redis cache. On writes, invalidate cache. This will improve performance under load.
	•	Session store: If we move away from JWT stateless, maybe switch to sessions stored in Redis for better control (optional; JWT stateless can still work fine).
	•	Use RabbitMQ for background jobs:
	•	Refactor places like email sending or NP tracking to not run in the request cycle. Instead, publish a message to queue and handle in a separate worker process.
	•	Develop worker scripts or small Node services for tasks: e.g., worker-email.js that listens to email_queue and sends emails. Use something like amqplib in Node to connect to RabbitMQ.
	•	We can run these workers as separate Docker containers (or PM2 processes on the server).
	•	Similarly for other tasks (report generation, heavy imports, etc.).
	•	Horizontal Scaling: If needed, replicate containers:
	•	The Next app container can be scaled (behind a load balancer) if high traffic. But ensure sticky session or use only stateless JWT so any instance works.
	•	Postgres scaling: likely move to a managed DB or at least set up streaming replication to a read replica if heavy read load. Could use PGPool or similar for load balancing reads.
	•	RabbitMQ could cluster if needed; not in short term.
	•	Kubernetes (Optional): If maintainability needs, we could migrate the Docker setup to K8s cluster. This adds complexity so only do if scaling demands multi-host orchestration.
	•	Monitoring & Logging: Now that we self-host, implement monitoring (Prometheus/Grafana or use a service like Datadog). Set up alerts for CPU, memory, DB connections. Also implement centralized logging (maybe ELK stack or CloudWatch if on AWS).
	•	Security Hardening:
	•	Ensure firewalls: DB and Redis not exposed publicly, only via internal network or localhost (if on same machine).
	•	Regularly update OS and Docker images for security patches.
	•	Set up backups for the new Postgres (nightly dumps or use continuous archiving).
	•	Possibly implement a WAF or at least fail2ban for repeated bad auth attempts.

Data Integrity During Migration:
We ensure no data lost:
	•	Because we import latest data right before flip, minimal or no gap. If a couple of writes happen in that gap, we might manually reconcile (hence trying to freeze).
	•	After migrating, keep old DB read-only accessible for a short time to verify any missing data comparisons.
	•	Inform users of maintenance to avoid usage during the exact switch time to prevent lost requests.

Rollback Plan:
Always have a rollback strategy:
	•	If migration fails, revert DNS to old, and continue using old environment until issues fixed.
	•	As long as we haven’t made irreversible changes to data on new system, we can always go back using the old data (maybe losing a few minutes of transactions, which we can communicate and possibly re-enter manually if needed).
	•	Keep backups of both new and old DB at point of switch.

Testing After Migration:
	•	Re-run all integration tests or at least manual test flows on the new environment with actual user accounts.
	•	Watch specifically for subtle differences, e.g., email sending might behave differently (like our emails might not be configured same as Supabase’s).
	•	Check that offline sync still works (with new endpoints).

Communicate to Users:
	•	Let users know of upcoming migration downtime and any changes (like if login method changes, e.g., if they might have to log in again due to token differences, tell them).
	•	Post-migration, if there are user-facing differences (like domain change, or new login procedure), provide clear instructions.

By following these steps, the migration is systematic:
	1.	Stand up parallel environment.
	2.	Migrate data.
	3.	Switch traffic.
	4.	Enhance on new infra.

The application architecture (FSD, etc.) remains largely the same, meaning minimal code changes. The biggest code adjustments revolve around auth and how we connect to DB (Supabase SDK vs direct). We would likely replace Supabase client usage with direct DB queries via a Node Postgres library (pg) or an ORM for convenience at this stage. That can be done gradually:
	•	Initially, we might still use Supabase client pointing to new PostgREST if we deployed PostgREST. But easier is to rewrite those few calls to use pg library and SQL queries or Knex.
	•	This might be done just before migration or as part of it.

Example Timeline for Migration (post-MVP, maybe when hitting ~50 active orgs or sooner to avoid constraints):
	•	Prepare env (week 1), test migration (week 2), schedule actual cutover on a weekend or night, 1-2 hours downtime, done by week 3. Then gradually add the new components (week 4 onwards as needed).

Overall, this plan ensures we can migrate without rewriting the entire code. We leverage compatibility where possible (like using same Postgres schema, continuing RLS). The modular design means our business logic is not tightly coupled to Supabase’s hosted environment, so moving it is feasible. We keep the option to further scale by adding more services once on our own infra.

16. Cost Model (From Free to Paid Operations)

Understanding the costs at various stages helps plan scaling and pricing. Initially, we exploit free-tier services to minimize burn. As we grow, costs will shift to paid plans or self-hosted infrastructure. Below is the cost model from MVP (nearly $0) to a fully scaled deployment, including key cost components:

Stage 1: MVP on Free Tiers (Current)
	•	Supabase (Free Plan): $0/month. Includes 500MB DB, 1GB storage, 5GB egress ￼, up to 50k MAUs. This covers our initial needs. Real cost: $0.
	•	Risk: If DB grows beyond 500MB or high traffic, we’d need upgrade. At MVP scale (a few orgs, minimal data), we expect maybe <50MB usage.
	•	Vercel (Hobby Plan): $0/month. Limits: 100 GB bandwidth, 100k function invocations ￼. Should suffice for early usage. Also 300 build minutes a month (not an issue if few deployments).
	•	We have no seat costs (just one developer account).
	•	No custom domain unless we add (but one custom domain is free on Hobby).
	•	Third-party API usage:
	•	Nova Poshta: Their API is free for reasonable usage (the cost is per shipment typically borne when buying labels). Using API to generate TTN likely requires an account but no explicit cost per call. So initially $0 (just test account).
	•	Email API: If using a service like SendGrid, free tier offers e.g. 100 emails/day free. That’s sufficient. So $0.
	•	SMS: Not using in MVP (if we did, e.g., Twilio has ~$0.0075 per SMS; we’ll avoid to keep free).
	•	Domain name: If we use a custom domain for the app, that costs $10/year (like .com). Possibly not needed immediately if using provided domain. If we purchase one (like ourcrm.ua), it’s negligible per month ($1).
	•	Development tools: Using free tier of GitHub, etc., no cost.
	•	Total MVP Monthly Cost: effectively $0 (maybe ~$1 if domain considered). It’s extremely low, aligning with budget constraints.

Stage 2: Early Growth – Upgrading Managed Services (When usage surpasses free limits, but not yet moving to own VPS fully)
	•	Supabase Pro Plan: $25/month base ￼. Gives 8GB DB, 100GB storage, 250GB bandwidth, plus no auto-sleep and better support.
	•	We might switch to this if we approach 500MB or need more connections.
	•	If usage still moderate, $25 covers a lot. Additional usage is pay-as-you-go (e.g., $0.125/GB over DB, etc. ￼, but likely not needed until much later).
	•	Alternatively, if nearing free limits, we might consider migrating to our own earlier if cost-effective. But at small scale, $25 is easier than managing a DB.
	•	Vercel Pro: $20/user/month. Possibly not needed if only one developer and project is still small - we could stay on Hobby and pay small overages if any. Overages on hobby are not explicit (Vercel might throttle or require upgrade once hitting limits).
	•	If we start hitting 100k function calls frequently or need custom domains/SSL enterprise settings, we might need Pro. But likely, we’d move to self-host rather than pay Vercel Pro, since Vercel’s benefit is ease rather than raw cost efficiency.
	•	Let’s assume for interim we either pay $20 for one account on Pro to get 1TB bandwidth if needed, or possibly stick to Hobby and see.
	•	Additional Third-party costs:
	•	Domain: Might add more (like separate domain per region or white-label domains). But those might be charged to clients or included in their fee if white-label.
	•	Emails: If surpass free, SendGrid 40k emails ~$14.95/month, or use another service. Initially negligible.
	•	If SMS integration added: e.g., using a local SMS provider at maybe ~$0.01 per SMS. If a client sends 100 SMS/month, that’s $1. If we include a small volume in plan or charge per usage. Early on, maybe pass cost to client or just limit usage.
	•	Admin/Support Costs: Not infra, but as usage grows, we might need to consider support (time cost). For cost model, infrastructure is main part.

At this stage, monthly cost might be around $45 (Supabase $25 + Vercel $20) if fully on managed. Possibly can delay Vercel upgrade, keeping it near $25.

Stage 3: Migration to Self-Hosted (Scale-up)
When user base and data outgrow Supabase Pro or to cut recurring costs:
	•	Cloud/VPS hosting: Suppose we move to a $40/month VPS (for example, 4 vCPU, 8GB RAM from a provider). We might need additional volumes for database storage if large (say $10 for extra SSD). Possibly a reserve for bandwidth if not unlimited (some cloud give certain TB, e.g., 2TB included).
	•	Alternatively, using managed Kubernetes or such might cost more (but likely we’ll do manual to save money).
	•	Also consider multiple servers for redundancy: maybe $80/month for two smaller instances (one app, one DB).
	•	Postgres: If self-managed on same VPS, cost is included in server cost. If using a managed DB service (to reduce ops burden), e.g., DigitalOcean Managed PG 8GB ~ $90/mo. That’s pricey; we likely self-host at first.
	•	Redis/RabbitMQ: If on same server as app (Docker), no extra cost besides using some RAM. If using a service like Redis Cloud (free up to 30MB or so, then ~$15/mo for more), but probably local is fine until huge scale.
	•	File Storage:
	•	Supabase’s 1GB might not suffice if lots of images. Could use AWS S3 or a Backblaze B2 bucket. E.g., 50GB on B2 is ~$2.5/mo plus egress fees. Minimal cost initially. Or host files on the VPS (but better to use S3 or similar for reliability).
	•	If using S3: cost ~$0.023/GB, so negligible for small usage.
	•	CDN/Bandwidth: If we have heavy usage (lots of images or global users), might add Cloudflare CDN (free plan likely fine) to offload bandwidth and get better global performance. Cloudflare free covers a lot, cost $0.
	•	Email/SMS at scale:
	•	Perhaps upgrade to SendGrid $15/mo if needed. Or set up our own SMTP (but likely just pay).
	•	SMS: If we incorporate, either we or client pay usage. We might integrate costs into a module fee.
	•	License/Other: If any enterprise features require paid components (maybe if we use an admin template or something).
	•	Maintenance overhead: running our own servers might incur staff time, which is a cost (not direct $, but consider if we need to hire devops at some scale).

Comparative analysis:
	•	At around, say, 100 customers (SMBs) using the system:
	•	Data: if each has 1000 customers and 1000 orders, total entries ~100k, which likely <100MB DB.
	•	Supabase Pro could still handle that at $25.
	•	But function calls might be high if each usage triggers many calls. Vercel might become pricey with 1M+ invocations (Pro includes 1M then maybe charges per million).
	•	Self-host might be cheaper if we have technical capacity because one server at $40 can handle quite a bit (depending on usage patterns).
	•	If we get enterprise clients requiring white-label and their own environment:
	•	We might charge them accordingly (maybe $200/mo) and we could dedicate a separate instance for them if needed at maybe $80 cost, still profitable.

Pricing Strategy vs Cost:
	•	We design pricing (Section 8) such that even at Pro plan $50/mo, if they are heavy user, our costs are covered.
	•	Example: A Pro user might use more DB and bandwidth, but if our infra is e.g., $50 for multiple customers, we rely on having enough customers to cover infra.
	•	We should keep track of cost per active user. Early on, mostly our time is biggest cost; infra is minor. As we scale, infra costs rise linearly-ish, but hopefully user count (revenue) outpaces.

Long-term cost (if hitting high scale):
	•	We might need multiple app servers ($20 each if on cloud VM), a load balancer ($some on cloud), a managed DB cluster ($200+ for high performance with replicas).
	•	Let’s say for 1000 SMB customers, maybe monthly infra $500-1000. But revenue from 1000 customers (even at $20 average) is $20k, so plenty to cover it.
	•	We keep the architecture such that we can always choose the most cost-effective route (e.g., open-source over paid where possible, one reason to self-host instead of scaling up Vercel where costs can skyrocket with usage).
	•	Vercel is convenient but usage overages can be expensive (GB-hour of function time costs, etc.). Likely cheaper to run a reserved server at scale.

Cost Summary Table:

Stage	Infrastructure & Services	Estimated Monthly Cost	Notes
MVP (Free Tier)	Supabase (Free), Vercel (Hobby), free email API, Nova Poshta (free)	~$0	Within free quotas: DB<500MB, ~0 cost. Domain $1 if used.
Managed (Pro)	Supabase Pro, Vercel Pro (1 user), possibly paid email SMS usage	~$45	Supabase $25, Vercel $20, small API usage costs. Supports moderate growth.
Self-Hosted (VPS)	1 x VPS (app+DB), domain, third-party services (S3, email small)	~$50 - $100	E.g., $40 VPS + backups, storage, etc. Gains capacity, fixed cost for quite some users.
Scaling Up	2-3 VPS (app cluster, separate DB server), managed DB or bigger instances, Cloudflare CDN, higher email volume	~$200 - $500	Covers hundreds of tenants; cost grows with user count and performance needs. (Cloud DB & multiple servers for reliability).
High Scale	Kubernetes cluster or managed containers, multi-region perhaps, managed DB cluster, pro support	$1000+	For enterprise-level scale (1000+ businesses, heavy use). Ensure costs in line with revenue.

These are ballpark figures. The plan is to keep costs low until revenue justifies increase:
	•	Use free as long as safe, then minimal paid (Supabase $25 likely earliest cost).
	•	Migrate to our own infra when it’s both technically necessary and cost-effective (our breakeven: if Supabase + Vercel cost > $50 and rising, might as well spend that on a VPS we control).

Revenue vs Cost:
	•	Initially, we likely don’t charge (maybe free trial). So it’s good our costs are near zero.
	•	Once charging (even a few paying customers), that should cover the $25 pro plan easily.
	•	E.g., 5 Basic plan customers at $20 = $100 revenue, while costs maybe $45, leaving margin to reinvest or cushion.
	•	As we scale users, cost per user actually goes down with self-host (to a point), improving margins.

White-label specific cost:
	•	If we run a separate instance for a white-label client, that might be an isolated server costing say $50. That client likely pays a premium (maybe $200-$500/mo), which covers their infra plus profit.

Contingency:
	•	Always keep an eye on cost anomalies (like if an API integration starts incurring cost unexpectedly, e.g., if we used Twilio for SMS, to ensure we bill those costs to clients accordingly or limit them).
	•	Also factor currency: if paying in USD for servers, but charging local UA businesses maybe in UAH, watch currency risk. Possibly we charge in USD or have a rate buffer.

Cost optimization:
	•	If on cloud, use reserved instances or saving plans when confident (e.g., commit to 1-year for discount).
	•	Use open-source alternatives to any paid service (like self-host a queuing system vs using a paid one).
	•	Write efficient code to avoid needing overly powerful servers too soon.
	•	Avoid needless data egress (e.g., cache content on client, use CDN to reduce server bandwidth).
	•	For database, optimize queries to reduce load (cheaper to spend dev time than to scale hardware often).

This cost model will be reviewed periodically as usage grows. Our migration plan in section 15 is aligned with cost control: by self-hosting at the right time, we trade some devops effort for potentially large cost savings (especially if we have many active users, the cost of cloud pro plans could surpass running our own hardware).

In conclusion, our strategy is:
	•	MVP: essentially free.
	•	Initial Growth: small fixed monthly (tens of $).
	•	Mid Growth: moderate ($100s) but hopefully well-covered by subscription revenue.
	•	Enterprise Scale: higher ($1000+), but by then revenue should be an order of magnitude higher, maintaining profitability.

This ensures the venture is financially viable at each stage and we can adjust pricing or resource allocation if the cost curve outpaces revenue unexpectedly.
