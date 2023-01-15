import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Text, TextArea, TextInput } from "@ignite-ui/react";
import { CalendarBlank, Clock } from "phosphor-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { ConfirmForm, FormActions, FormError, FormHeader } from "./styles";

const confirmFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Digite um e-mail válido"),
  notes: z.string().optional(),
});

type ConfirmFormValues = z.infer<typeof confirmFormSchema>;

export function ConfirmStep() {
  const { formState, handleSubmit, register } = useForm<ConfirmFormValues>({
    resolver: zodResolver(confirmFormSchema),
    defaultValues: {
      email: "",
      name: "",
      notes: "",
    },
  });
  const onConfirmSchedulingSubmit: SubmitHandler<ConfirmFormValues> = (
    data
  ) => {
    console.log("confirm");
  };

  return (
    <ConfirmForm as="form" onSubmit={handleSubmit(onConfirmSchedulingSubmit)}>
      <FormHeader>
        <Text>
          <CalendarBlank />
          22 de abril de 2021
        </Text>

        <Text>
          <Clock />
          10:00
        </Text>
      </FormHeader>

      <label>
        <Text size="sm">Nome completo</Text>
        <TextInput placeholder="Seu nome" {...register("name")} />
        {formState.errors.name && (
          <FormError size="sm">{formState.errors.name.message}</FormError>
        )}
      </label>

      <label>
        <Text size="sm">Endereço de e-mail</Text>
        <TextInput
          type="email"
          placeholder="johndoe@example.com"
          {...register("email")}
        />
        {formState.errors.email && (
          <FormError size="sm">{formState.errors.email.message}</FormError>
        )}
      </label>

      <label>
        <Text size="sm">Observações</Text>
        <TextArea {...register("notes")} />
        {formState.errors.notes && (
          <FormError size="sm">{formState.errors.notes.message}</FormError>
        )}
      </label>

      <FormActions>
        <Button
          type="button"
          variant="tertiary"
          disabled={formState.isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={formState.isSubmitting}>
          Confirmar
        </Button>
      </FormActions>
    </ConfirmForm>
  );
}
