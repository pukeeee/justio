import type {
  CreateClientRequest,
  CreateClientResponse,
  UpdateClientRequest,
  UpdateClientResponse,
  GetClientsResponse,
  ClientDetailsResponse,
} from "../contracts/client.contracts";
import type { CreateClientDTO } from "@/backend/application/dtos/clients/create-client.dto";
import type { UpdateClientDTO } from "@/backend/application/dtos/clients/update-client.dto";
import type { GetClientsListResponse } from "@/backend/application/dtos/clients/get-clients-list-response.dto";
import type { ClientDetailsDTO } from "@/backend/application/dtos/clients/client-details.dto";
import { ClientType as DomainClientType } from "@/backend/domain/value-objects/client-type.enum";
import { Client } from "@/backend/domain/entities/client.entity";
import { Individual } from "@/backend/domain/entities/individual.entity";
import { Company } from "@/backend/domain/entities/company.entity";

/**
 * Mapper для конвертації між API contracts та domain/application DTOs
 * 
 * Відповідальність:
 * - Конвертація типів (string ↔ Date, enum ↔ literal types)
 * - Валідація форматів (ISO dates, emails тощо)
 * - Трансформація структур даних
 */
export class ClientMapper {
  /**
   * API Request → Use Case DTO (для створення)
   */
  toCreateDto(request: CreateClientRequest, userId: string): CreateClientDTO {
    // Базові поля, спільні для обох типів
    const base = {
      workspaceId: request.workspaceId,
      email: request.email,
      phone: request.phone,
      address: request.address,
      note: request.note,
      createdBy: userId,
    };

    // Individual
    if (request.clientType === 'individual') {
      return {
        ...base,
        clientType: DomainClientType.INDIVIDUAL,
        firstName: request.firstName!,
        lastName: request.lastName!,
        middleName: request.middleName,
        // Конвертація ISO string → Date
        dateOfBirth: request.dateOfBirth ? new Date(request.dateOfBirth) : null,
        taxNumber: request.taxNumber,
        isFop: request.isFop ?? false,
        passportDetails: request.passportDetails ? {
          series: request.passportDetails.series || null,
          number: request.passportDetails.number,
          issuedBy: request.passportDetails.issuedBy || '', // Fallback for stricter types if needed
          // Конвертація ISO string → Date
          issuedDate: new Date(request.passportDetails.issuedDate || ''),
        } : null,
      };
    }

    // Company
    return {
      ...base,
      clientType: DomainClientType.COMPANY,
      companyName: request.companyName!,
      taxId: request.taxId,
    };
  }

  /**
   * API Request → Use Case DTO (для оновлення)
   */
  toUpdateDto(request: UpdateClientRequest): UpdateClientDTO {
    const dto: UpdateClientDTO = {
      id: request.id,
      email: request.email,
      phone: request.phone,
      address: request.address,
      note: request.note,
    };

    // Individual fields
    if (request.clientType === 'individual') {
        if (request.firstName) dto.firstName = request.firstName;
        if (request.lastName) dto.lastName = request.lastName;
        if (request.middleName !== undefined) dto.middleName = request.middleName;
        if (request.dateOfBirth !== undefined) {
          dto.dateOfBirth = request.dateOfBirth ? new Date(request.dateOfBirth) : null;
        }
        if (request.taxNumber !== undefined) dto.taxNumber = request.taxNumber;
        if (request.isFop !== undefined) dto.isFop = request.isFop;
        if (request.passportDetails !== undefined) {
          dto.passportDetails = request.passportDetails ? {
            series: request.passportDetails.series || null,
            number: request.passportDetails.number,
            issuedBy: request.passportDetails.issuedBy || '',
            issuedDate: new Date(request.passportDetails.issuedDate || ''),
          } : null;
        }
    }

    // Company fields
    if (request.clientType === 'company') {
        if (request.companyName) dto.companyName = request.companyName;
        if (request.taxId !== undefined) dto.taxId = request.taxId;
    }

    return dto;
  }

  /**
   * Domain → API Response (після створення)
   */
  toCreateResponse(
    client: Client,
    details: Individual | Company
  ): CreateClientResponse {
    return {
      id: client.id,
      workspaceId: client.workspaceId,
      clientType: client.clientType === DomainClientType.INDIVIDUAL ? 'individual' : 'company',
      // Конвертація Date → ISO string
      createdAt: client.createdAt.toISOString(),
    };
  }

  /**
   * Domain → API Response (після оновлення)
   */
  toUpdateResponse(
    client: Client,
    details: Individual | Company
  ): UpdateClientResponse {
    return {
      id: client.id,
      updatedAt: client.updatedAt.toISOString(),
    };
  }

  /**
   * Use Case Response → API Response (список)
   */
  toListResponse(useCaseResponse: GetClientsListResponse): GetClientsResponse {
    return {
      items: useCaseResponse.items.map(item => ({
        id: item.id,
        clientType: item.clientType === DomainClientType.INDIVIDUAL ? 'individual' : 'company',
        displayName: item.displayName,
        email: item.email,
        phone: item.phone,
        taxNumber: item.taxNumber,
        taxId: item.taxId,
        isFop: item.isFop,
        createdAt: item.createdAt.toISOString(),
      })),
      total: useCaseResponse.total,
      limit: 20, // TODO: отримувати з request
      offset: 0,
    };
  }

  /**
   * Use Case Response → API Response (деталі)
   */
  toDetailsResponse(useCaseResponse: ClientDetailsDTO): ClientDetailsResponse {
    const { client, individual, company } = useCaseResponse;

    const response: ClientDetailsResponse = {
      id: client.id,
      workspaceId: client.workspaceId,
      clientType: client.clientType === DomainClientType.INDIVIDUAL ? 'individual' : 'company',
      email: client.email,
      phone: client.phone,
      address: client.address,
      note: client.note,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    };

    // Individual details
    if (individual) {
      response.individual = {
        firstName: individual.firstName,
        lastName: individual.lastName,
        middleName: individual.middleName,
        fullName: individual.fullName,
        dateOfBirth: individual.dateOfBirth?.toISOString() || null,
        taxNumber: individual.taxNumber,
        isFop: individual.isFop,
        passportDetails: individual.passportDetails ? {
          series: individual.passportDetails.series,
          number: individual.passportDetails.number,
          issuedBy: individual.passportDetails.issuedBy,
          issuedDate: individual.passportDetails.issuedDate.toISOString(),
        } : null,
      };
    }

    // Company details
    if (company) {
      response.company = {
        name: company.name,
        taxId: company.taxId,
      };
    }

    return response;
  }
}
