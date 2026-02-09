"use client";

import { useEffect, useMemo } from "react";
import {
  useForm,
  useWatch,
  UseFormRegister,
  FieldErrors,
  SubmitHandler,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientSchema } from "@/frontend/entities/client/model/schema";
import { CreateClient } from "@/frontend/entities/client/model/types";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldContent,
} from "@/frontend/shared/components/ui/field";
import { Input } from "@/frontend/shared/components/ui/input";
import { Button } from "@/frontend/shared/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/frontend/shared/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/frontend/shared/components/ui/accordion";
import { Textarea } from "@/frontend/shared/components/ui/textarea";
import { Checkbox } from "@/frontend/shared/components/ui/checkbox";
import { Loader2, User, Building2 } from "lucide-react";
import { cn } from "@/frontend/shared/lib/utils";
import { toast } from "sonner";
import { formatPhoneNumber } from "../../create-client/lib/formatPhoneNumber";
import { cleanPhoneNumber } from "../../create-client/lib/cleanPhoneNumber";

// Визначаємо підтипи на основі CreateClient
type CreateIndividual = Extract<CreateClient, { clientType: "individual" }>;
type CreateCompany = Extract<CreateClient, { clientType: "company" }>;

interface ClientFormProps {
  workspaceId: string;
  onSuccess?: () => void;
  onSubmit: (data: CreateClient) => Promise<void>;
  defaultValues?: Partial<CreateClient>;
  mode: "create" | "edit";
  className?: string;
  isSubmitting?: boolean;
}

export function ClientForm({
  workspaceId,
  onSuccess,
  onSubmit,
  defaultValues,
  mode,
  className,
  isSubmitting: externalIsSubmitting,
}: ClientFormProps) {
  const initialValues = useMemo<CreateClient>(() => {
    const base = {
      workspaceId,
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      address: defaultValues?.address ?? "",
      note: defaultValues?.note ?? "",
    };

    if (defaultValues?.clientType === "company") {
      return {
        ...base,
        clientType: "company",
        companyName: defaultValues.companyName ?? "",
        taxId: defaultValues.taxId ?? "",
      } as CreateCompany;
    }

    const individual = defaultValues as Partial<CreateIndividual> | undefined;
    
    return {
      ...base,
      clientType: "individual",
      firstName: individual?.firstName ?? "",
      lastName: individual?.lastName ?? "",
      middleName: individual?.middleName ?? "",
      isFop: individual?.isFop ?? false,
      taxNumber: individual?.taxNumber ?? "",
      dateOfBirth: individual?.dateOfBirth ?? null,
      passportDetails: {
        series: individual?.passportDetails?.series ?? "",
        number: individual?.passportDetails?.number ?? "",
        issuedBy: individual?.passportDetails?.issuedBy ?? "",
        issuedDate: individual?.passportDetails?.issuedDate ?? "",
      },
    } as CreateIndividual;
    // Використовуємо JSON.stringify для глибокого порівняння defaultValues, 
    // щоб уникнути перерахунку при зміні посилання на об'єкт з тими самими даними
  }, [workspaceId, defaultValues]);

  const form = useForm<CreateClient>({
    resolver: zodResolver(createClientSchema),
    defaultValues: initialValues,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: formIsSubmitting, isDirty },
  } = form;

  const isSubmitting = externalIsSubmitting || formIsSubmitting;

  // Оновлюємо форму при зміні initialValues (тільки якщо користувач ще нічого не міняв)
  useEffect(() => {
    if (defaultValues && !isDirty) {
      reset(initialValues);
    }
  }, [initialValues, reset, isDirty, defaultValues]);

  const clientType = useWatch({
    control,
    name: "clientType",
  });

  const handleTabChange = (val: string) => {
    if (mode === "edit") return;

    const newType = val as "individual" | "company";
    const currentValues = form.getValues();

    if (newType === "individual") {
      reset({
        ...currentValues,
        clientType: "individual",
        // Скидаємо поля компанії та встановлюємо дефолтні для фізичної особи, якщо їх немає
        firstName: "",
        lastName: "",
        middleName: "",
        isFop: false,
        taxNumber: "",
        dateOfBirth: null,
        passportDetails: {
          series: "",
          number: "",
          issuedBy: "",
          issuedDate: "",
        },
      } as CreateClient);
    } else {
      reset({
        ...currentValues,
        clientType: "company",
        // Скидаємо поля фіз особи
        companyName: "",
        taxId: "",
      } as CreateClient);
    }
  };

  const handleFormSubmit: SubmitHandler<CreateClient> = async (data) => {
    try {
      // Очищення даних перед відправкою
      const cleanData = { ...data };

      // Очищаємо телефон перед відправкою
      if (cleanData.phone) {
        cleanData.phone = cleanPhoneNumber(cleanData.phone);
      }

      if (cleanData.clientType === "individual" && cleanData.passportDetails) {
        const pd = cleanData.passportDetails;
        // Якщо всі поля пусті або undefined, видаляємо об'єкт
        if (!pd.series && !pd.number && !pd.issuedBy && !pd.issuedDate) {
          cleanData.passportDetails = undefined;
        }
      }

      await onSubmit(cleanData);
      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit, (errors) => {
        console.error("Form validation errors:", errors);
        toast.error("Будь ласка, перевірте правильність заповнення полів");
      })}
      className={cn("flex flex-col h-full min-h-0", className)}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 p-6">
          <Tabs
            value={clientType}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="individual"
                disabled={mode === "edit"}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Фізична особа
              </TabsTrigger>
              <TabsTrigger
                value="company"
                disabled={mode === "edit"}
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Компанія
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <FieldContent>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    {...register("email")}
                  />
                  <FieldError errors={[errors.email]} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Телефон</FieldLabel>
                <FieldContent>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        id="phone"
                        type="tel"
                        placeholder="+38 (0XX) XXX-XX-XX"
                        onChange={(e) => {
                          const formatted = formatPhoneNumber(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    )}
                  />
                  <FieldError errors={[errors.phone]} />
                </FieldContent>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="address">Адреса</FieldLabel>
              <FieldContent>
                <Input
                  id="address"
                  placeholder="вул. Шевченка, 1, м. Київ"
                  {...register("address")}
                />
                <FieldError errors={[errors.address]} />
              </FieldContent>
            </Field>

            {clientType === "individual" ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                {(() => {
                  const reg =
                    register as unknown as UseFormRegister<CreateIndividual>;
                  const errs =
                    errors as unknown as FieldErrors<CreateIndividual>;

                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel htmlFor="lastName">
                            Прізвище <span className="text-destructive">*</span>
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              id="lastName"
                              placeholder="Петренко"
                              {...reg("lastName")}
                            />
                            <FieldError errors={[errs.lastName]} />
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="firstName">
                            Ім`я <span className="text-destructive">*</span>
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              id="firstName"
                              placeholder="Іван"
                              {...reg("firstName")}
                            />
                            <FieldError errors={[errs.firstName]} />
                          </FieldContent>
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel htmlFor="middleName">
                            По батькові
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              id="middleName"
                              placeholder="Іванович"
                              {...reg("middleName")}
                            />
                            <FieldError errors={[errs.middleName]} />
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="taxNumber">РНОКПП</FieldLabel>
                          <FieldContent>
                            <Input
                              id="taxNumber"
                              placeholder="1234567890"
                              maxLength={10}
                              {...reg("taxNumber")}
                            />
                            <FieldError errors={[errs.taxNumber]} />
                          </FieldContent>
                        </Field>
                      </div>

                      <div className="flex items-center space-x-2 py-2">
                        <Controller
                          name="isFop"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              id="isFop"
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <label
                          htmlFor="isFop"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Зареєстрований як ФОП
                        </label>
                      </div>

                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="passport" className="border-b-0">
                          <AccordionTrigger
                            className={cn(
                              "text-sm text-muted-foreground hover:text-foreground py-2",
                              errs.passportDetails && "text-destructive",
                            )}
                          >
                            Паспортні дані (опціонально)
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                              <Field>
                                <FieldLabel htmlFor="passportSeries">
                                  Серія
                                </FieldLabel>
                                <FieldContent>
                                  <Input
                                    id="passportSeries"
                                    placeholder="АА"
                                    {...reg("passportDetails.series")}
                                  />
                                  <FieldError
                                    errors={[errs.passportDetails?.series]}
                                  />
                                </FieldContent>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="passportNumber">
                                  Номер
                                </FieldLabel>
                                <FieldContent>
                                  <Input
                                    id="passportNumber"
                                    placeholder="123456"
                                    {...reg("passportDetails.number")}
                                  />
                                  <FieldError
                                    errors={[errs.passportDetails?.number]}
                                  />
                                </FieldContent>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="issuedBy">
                                  Ким виданий
                                </FieldLabel>
                                <FieldContent>
                                  <Input
                                    id="issuedBy"
                                    placeholder="Назва органу"
                                    {...reg("passportDetails.issuedBy")}
                                  />
                                  <FieldError
                                    errors={[errs.passportDetails?.issuedBy]}
                                  />
                                </FieldContent>
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="issuedDate">
                                  Дата видачі
                                </FieldLabel>
                                <FieldContent>
                                  <Input
                                    id="issuedDate"
                                    type="date"
                                    max="9999-12-31"
                                    min="1900-01-01"
                                    {...reg("passportDetails.issuedDate")}
                                  />
                                  <FieldError
                                    errors={[errs.passportDetails?.issuedDate]}
                                  />
                                </FieldContent>
                              </Field>
                            </div>
                            {errs.passportDetails?.root && (
                              <FieldError
                                errors={[errs.passportDetails.root]}
                                className="mt-2"
                              />
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                {(() => {
                  const reg =
                    register as unknown as UseFormRegister<CreateCompany>;
                  const errs = errors as unknown as FieldErrors<CreateCompany>;

                  return (
                    <>
                      <Field>
                        <FieldLabel htmlFor="companyName">
                          Назва компанії{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            id="companyName"
                            placeholder="ТОВ 'Назва'"
                            {...reg("companyName")}
                          />
                          <FieldError errors={[errs.companyName]} />
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="taxId">ЄДРПОУ</FieldLabel>
                        <FieldContent>
                          <Input
                            id="taxId"
                            placeholder="12345678"
                            maxLength={8}
                            {...reg("taxId")}
                          />
                          <FieldError errors={[errs.taxId]} />
                        </FieldContent>
                      </Field>

                      <div className="rounded-md border border-dashed p-4 text-center bg-muted/30">
                        <p className="text-sm text-muted-foreground mb-1">
                          Представники компанії
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          Функціонал пов`язаних контактів у розробці.
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="note">Примітки</FieldLabel>
              <FieldContent>
                <Textarea
                  id="note"
                  placeholder="Додаткова інформація..."
                  className="resize-none min-h-20"
                  {...register("note")}
                />
                <FieldError errors={[errors.note]} />
              </FieldContent>
            </Field>
          </div>
        </div>
      </div>

      <div className="flex justify-end p-6 border-t bg-background shrink-0">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto cursor-pointer"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create"
            ? clientType === "individual"
              ? "Створити клієнта"
              : "Створити компанію"
            : "Оновити клієнта"}
        </Button>
      </div>
    </form>
  );
}
