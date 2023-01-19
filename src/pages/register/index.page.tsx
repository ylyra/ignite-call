import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Heading, MultiStep, Text, TextInput } from "@ignite-ui/react";
import { AxiosError } from "axios";
import { GetServerSideProps } from "next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { ArrowRight } from "phosphor-react";
import { useCallback } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { api } from "../../lib/axios";
import { Container, Form, FormError, Header } from "./styles";

const schema = z.object({
  username: z
    .string()
    .min(3, "O usuário deve ter pelo menos 3 caracteres")
    .regex(/^([a-z\\-]+)$/i, "O usuário deve conter apenas letras e hifens")
    .transform((username) => username.toLowerCase()),
  fullName: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
});

type FormValues = z.infer<typeof schema>;

type RegisterProps = {
  username: string;
};

export default function Register({ username }: RegisterProps) {
  const router = useRouter();

  const { formState, handleSubmit, register } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username,
      fullName: "",
    },
  });

  const onUsernameRegister: SubmitHandler<FormValues> = useCallback(
    async (data) => {
      try {
        await api.post("/users", data);

        await router.push("/register/connect-calendar");
      } catch (error) {
        if (error instanceof AxiosError && error?.response?.data?.message) {
          alert(error.response.data.message);
        }
        console.error(error);
      }
    },
    [router]
  );

  return (
    <>
      <NextSeo title="Crie uma conta" />
      <Container>
        <Header>
          <Heading as="strong">Bem-vindo ao Ignite Call</Heading>

          <Text>
            Precisamos de algumas informações para criar seu perfil. Ah, você
            pode editar essas informações depois
          </Text>

          <MultiStep size={4} currentStep={1} />
        </Header>

        <Form as="form" onSubmit={handleSubmit(onUsernameRegister)}>
          <label>
            <Text size="sm">Nome de usuário</Text>

            <TextInput
              prefix="ignite.com/"
              placeholder="seu-usuario"
              {...register("username")}
            />

            {formState.errors.username && (
              <FormError>{formState.errors.username.message}</FormError>
            )}
          </label>

          <label>
            <Text size="sm">Nome completo</Text>

            <TextInput placeholder="Seu nome" {...register("fullName")} />

            {formState.errors.fullName && (
              <FormError>{formState.errors.fullName.message}</FormError>
            )}
          </label>

          <Button type="submit" disabled={formState.isSubmitting}>
            Próximo passo
            <ArrowRight />
          </Button>
        </Form>
      </Container>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const querySchema = z.object({
    username: z.string().min(3),
  });

  try {
    const query = querySchema.parse(ctx.query);

    return {
      props: {
        username: query.username,
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};
