import { Button, Heading, MultiStep, Text } from "@ignite-ui/react";
import { signIn, useSession } from "next-auth/react";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowRight, Check } from "phosphor-react";
import { Container, Header } from "../styles";
import { AuthError, ConnectBox, ConnectItem } from "./styles";

const ERRORS = {
  permissions: "Você precisa permitir o acesso ao seu calendário",
};

export default function Register() {
  const session = useSession();
  const router = useRouter();

  const errorMessage = router.query.error
    ? ERRORS[router.query.error as keyof typeof ERRORS]
    : "";

  const isSignedIn = session.status === "authenticated";

  const handleConnectCalendar = async () => {
    await signIn("google");
  };

  return (
    <Container>
      <NextSeo title="Conecte sua agenda" noindex />
      <Header>
        <Heading as="strong">Conecte sua agenda!</Heading>

        <Text>
          Conecte o seu calendário para verificar automaticamente as horas
          ocupadas e os novos eventos à medida em que são agendados.
        </Text>

        <MultiStep size={4} currentStep={2} />
      </Header>

      <ConnectBox>
        <ConnectItem>
          <Text>Google Calendar</Text>

          {isSignedIn ? (
            <Button size="sm" disabled>
              Conectado
              <Check />
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleConnectCalendar}
            >
              Conectar
              <ArrowRight />
            </Button>
          )}
        </ConnectItem>

        {errorMessage && <AuthError size="sm">{errorMessage}</AuthError>}

        {/* @ts-ignore */}
        <Button
          type="submit"
          as={Link}
          href="/register/time-intervals"
          disabled={!isSignedIn}
        >
          Próximo passo
          <ArrowRight />
        </Button>
      </ConnectBox>
    </Container>
  );
}
