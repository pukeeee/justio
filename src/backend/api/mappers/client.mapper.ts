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
   * Допоміжний метод для перетворення порожніх рядків або undefined у null.
   * Важливо для коректного збереження необов'язкових полів у БД.
   */
  private normalize<T>(value: T | undefined): T | null {
    if (value === undefined || (typeof value === "string" && value.trim() === "")) {
      return null;
    }
    return value;
  }

  /**
   * API Request → Use Case DTO (для створення)
   */
  toCreateDto(request: CreateClientRequest, userId: string): CreateClientDTO {
    // Базові поля, спільні для обох типів
    const base = {
      workspaceId: request.workspaceId,
      email: this.normalize(request.email),
      phone: this.normalize(request.phone),
      address: this.normalize(request.address),
      note: this.normalize(request.note),
      createdBy: userId,
    };

    // Individual
    if (request.clientType === "individual") {
      return {
        ...base,
        clientType: DomainClientType.INDIVIDUAL,
        firstName: request.firstName!,
        lastName: request.lastName!,
        middleName: this.normalize(request.middleName),
        // Конвертація ISO string → Date
        dateOfBirth: request.dateOfBirth ? new Date(request.dateOfBirth) : null,
        taxNumber: this.normalize(request.taxNumber),
        isFop: request.isFop ?? false,
        passportDetails: request.passportDetails && (request.passportDetails.number || request.passportDetails.issuedBy || request.passportDetails.issuedDate)
          ? {
              series: this.normalize(request.passportDetails.series),
              number: request.passportDetails.number || "",
              issuedBy: request.passportDetails.issuedBy || "",
              issuedDate: request.passportDetails.issuedDate
                ? new Date(request.passportDetails.issuedDate)
                : new Date(),
            }
          : null,
      };
    }

    // Company
    return {
      ...base,
      clientType: DomainClientType.COMPANY,
      companyName: request.companyName!,
      taxId: this.normalize(request.taxId),
    };
  }

  /**
   * API Request → Use Case DTO (для оновлення)
   */
  toUpdateDto(request: UpdateClientRequest): UpdateClientDTO {
    const dto: UpdateClientDTO = {
      id: request.id,
      workspaceId: request.workspaceId,
      email: this.normalize(request.email),
      phone: this.normalize(request.phone),
      address: this.normalize(request.address),
      note: this.normalize(request.note),
    };

    // Individual fields
    if (request.clientType === "individual") {
      if (request.firstName) dto.firstName = request.firstName;
      if (request.lastName) dto.lastName = request.lastName;
      if (request.middleName !== undefined)
        dto.middleName = this.normalize(request.middleName);
      if (request.dateOfBirth !== undefined) {
        dto.dateOfBirth = request.dateOfBirth
          ? new Date(request.dateOfBirth)
          : null;
      }
      if (request.taxNumber !== undefined)
        dto.taxNumber = this.normalize(request.taxNumber);
      if (request.isFop !== undefined) dto.isFop = request.isFop;
      if (request.passportDetails !== undefined) {
        dto.passportDetails = request.passportDetails && (request.passportDetails.number || request.passportDetails.issuedBy || request.passportDetails.issuedDate)
          ? {
              series: this.normalize(request.passportDetails.series),
              number: request.passportDetails.number || "",
              issuedBy: request.passportDetails.issuedBy || "",
              issuedDate: request.passportDetails.issuedDate
                ? new Date(request.passportDetails.issuedDate)
                : new Date(),
            }
          : null;
      }
    }

    // Company fields
    if (request.clientType === "company") {
      if (request.companyName) dto.companyName = request.companyName;
      if (request.taxId !== undefined) dto.taxId = this.normalize(request.taxId);
    }

    return dto;
  }

  /**
   * Domain → API Response (після створення)
   */
  toCreateResponse(client: Client): CreateClientResponse {
    return {
      id: client.id,
      workspaceId: client.workspaceId,
      clientType:
        client.clientType === DomainClientType.INDIVIDUAL
          ? "individual"
          : "company",
      // Конвертація Date → ISO string
      createdAt: client.createdAt.toISOString(),
    };
  }

  /**
   * Domain → API Response (після оновлення)
   */
  toUpdateResponse(client: Client): UpdateClientResponse {
    return {
      id: client.id,
      updatedAt: client.updatedAt.toISOString(),
    };
  }

  /**
   * Use Case Response → API Response (список)
   */
  toListResponse(
    useCaseResponse: GetClientsListResponse,
    limit: number,
    offset: number,
  ): GetClientsResponse {
    return {
      items: useCaseResponse.items.map((item) => ({
        id: item.id,
        workspaceId: item.workspaceId,
        clientType:
          item.clientType === DomainClientType.INDIVIDUAL
            ? "individual"
            : "company",
        displayName: item.displayName,
        email: item.email,
        phone: item.phone,
        taxNumber: item.taxNumber,
        taxId: item.taxId,
        isFop: item.isFop,
        createdAt: item.createdAt.toISOString(),
      })),
      total: useCaseResponse.total,
      limit,
      offset,
    };
  }

  /**
   * Use Case Response → API Response (деталі)
   */
  toDetailsResponse(useCaseResponse: ClientDetailsDTO): ClientDetailsResponse {
    const { client, individual, company } = useCaseResponse;

    const base = {
      id: client.id,
      workspaceId: client.workspaceId,
      email: client.email,
      phone: client.phone,
      address: client.address,
      note: client.note,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    };

    // Individual details
    if (client.clientType === DomainClientType.INDIVIDUAL && individual) {
      return {
        ...base,
        clientType: "individual",
        firstName: individual.firstName,
        lastName: individual.lastName,
        middleName: individual.middleName,
        fullName: individual.fullName,
        dateOfBirth: individual.dateOfBirth?.toISOString() || null,
        taxNumber: individual.taxNumber,
        isFop: individual.isFop,
        passportDetails: individual.passportDetails
          ? {
              series: individual.passportDetails.series,
              number: individual.passportDetails.number,
              issuedBy: individual.passportDetails.issuedBy,
              issuedDate: individual.passportDetails.issuedDate.toISOString(),
            }
          : null,
      };
    }

    // Company details
    return {
      ...base,
      clientType: "company",
      companyName: company?.name || "",
      taxId: company?.taxId || null,
    };
  }
}
