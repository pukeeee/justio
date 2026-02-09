"use client";

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
import { createClientAction } from "@/frontend/features/client/create-client/actions/create-client.action";
import { formatPhoneNumber } from "../lib/formatPhoneNumber";
import { cleanPhoneNumber } from "../lib/cleanPhoneNumber";

// Визначаємо підтипи на основі CreateClient
type CreateIndividual = Extract<CreateClient, { clientType: "individual" }>;
type CreateCompany = Extract<CreateClient, { clientType: "company" }>;

interface CreateClientFormProps {
  workspaceId: string;
  onSuccess?: () => void;
  className?: string;
}

export function CreateClientForm({
  workspaceId,
  onSuccess,
  className,
}: CreateClientFormProps) {
  // Початкові значення для фізичної особи
  const initialValues: CreateIndividual = {
    workspaceId,
    clientType: "individual",
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    address: "",
    isFop: false,
    note: "",
    taxNumber: "",
    dateOfBirth: null,
    passportDetails: {
      series: "",
      number: "",
      issuedBy: "",
      issuedDate: "",
    },
  };

  const form = useForm<CreateClient>({
    resolver: zodResolver(createClientSchema),
    defaultValues: initialValues as CreateClient,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const clientType = useWatch({
    control,
    name: "clientType",
  });

  const handleTabChange = (val: string) => {
    const newType = val as "individual" | "company";
    const currentValues = form.getValues();

    if (newType === "individual") {
      reset({
        ...initialValues,
        clientType: "individual",
        email: currentValues.email,
        phone: currentValues.phone,
        address: currentValues.address,
        note: currentValues.note,
        isFop:
          currentValues.clientType === "individual"
            ? currentValues.isFop
            : false,
      } as CreateClient);
    } else {
      reset({
        workspaceId,
        clientType: "company",
        companyName: "",
        taxId: "",
        email: currentValues.email || "",
        phone: currentValues.phone || "",
        address: currentValues.address || "",
        note: currentValues.note || "",
      } as CreateClient);
    }
  };

  // ... (решта імпортів та функцій залишається)

  const onSubmit: SubmitHandler<CreateClient> = async (data) => {
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

      console.log("Client-side submitting:", cleanData);

      const result = await createClientAction(cleanData);

      if (result.success) {
        onSuccess?.();
      } else {
        // Тут можна додати виклик toast.error(result.error)
        console.error("Action error:", result.error);
        alert(`Помилка: ${result.error}`);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Фізична особа
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-2">
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
                          <AccordionTrigger className="text-sm text-muted-foreground hover:text-foreground py-2">
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
                                </FieldContent>
                              </Field>
                            </div>{" "}
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
                            maxLength={12}
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
          className="w-full sm:w-auto"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {clientType === "individual"
            ? "Створити клієнта"
            : "Створити компанію"}
        </Button>
      </div>
    </form>
  );
}
