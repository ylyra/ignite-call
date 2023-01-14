import { zodResolver } from "@hookform/resolvers/zod";
import {
  Avatar,
  Button,
  Heading,
  MultiStep,
  Text,
  TextArea,
} from "@ignite-ui/react";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ArrowRight } from "phosphor-react";
import { useCallback } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "../../../lib/axios";
import { buildNextAuthOptions } from "../../api/auth/[...nextauth].api";
import { Container, Header } from "../styles";
import { FormAnnotation, ProfileBox } from "./styles";

const schema = z.object({
  bio: z.string().min(10).max(400),
});

type FormValues = z.infer<typeof schema>;

export default function UpdateProfile() {
  const router = useRouter();
  const session = useSession();

  const { formState, handleSubmit, register } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      bio: "",
    },
  });

  const onUsernameUpdateProfile: SubmitHandler<FormValues> = useCallback(
    async (data) => {
      await api.patch("/users/profile", data);

      await router.push(`/schedule/${session.data?.user.username}`);
    },
    [router]
  );

  return (
    <Container>
      <Header>
        <Heading as="strong">Bem-vindo ao Ignite Call</Heading>

        <Text>
          Precisamos de algumas informações para criar seu perfil. Ah, você pode
          editar essas informações depois
        </Text>

        <MultiStep size={4} currentStep={4} />
      </Header>

      <ProfileBox as="form" onSubmit={handleSubmit(onUsernameUpdateProfile)}>
        <label>
          <Text size="sm">Foto de perfil</Text>
          <Avatar src={session.data?.user.avatar_url} />
        </label>

        <label>
          <Text size="sm">Sobre você</Text>
          <div>
            <TextArea {...register("bio")} />
          </div>
          <FormAnnotation size="sm">
            Fale um pouco sobre você. Isto será exibido em sua página pessoal
          </FormAnnotation>
        </label>
        <Button type="submit" disabled={formState.isSubmitting}>
          Finalizar
          <ArrowRight />
        </Button>
      </ProfileBox>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await unstable_getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res)
  );

  return {
    props: {
      session,
    },
  };
};
