import { Avatar, Heading, Text } from "@ignite-ui/react";
import { GetStaticPaths, GetStaticProps } from "next";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { ScheduleForm } from "./ScheduleForm";
import { Container, UserHeader } from "./styles";

interface Props {
  user: {
    name: string;
    bio: string;
    avatarUrl: string;
  };
}

export default function Schedule({ user }: Props) {
  return (
    <Container>
      <UserHeader>
        <Avatar src={user.avatarUrl} />
        <Heading>{user.name}</Heading>
        <Text>{user.bio}</Text>
      </UserHeader>

      <ScheduleForm />
    </Container>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  try {
    const paramsSchema = z.object({
      username: z.string(),
    });

    const { username } = paramsSchema.parse(ctx.params);

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) throw new Error("User not found");

    return {
      props: {
        user: {
          name: user.name,
          bio: user.bio,
          avatarUrl: user.avatar_url,
        },
      },
      revalidate: 60 * 60 * 24, // 24 hours
    };
  } catch {
    return {
      notFound: true,
    };
  }
};
