import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Text, TextInput } from '@ignite-ui/react'
import { useRouter } from 'next/router'
import { ArrowRight } from 'phosphor-react'
import { useCallback } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormAnnotation } from './styles'

const schema = z.object({
  username: z
    .string()
    .min(3, 'O usuário deve ter pelo menos 3 caracteres')
    .regex(/^([a-z\\-]+)$/i, 'O usuário deve conter apenas letras e hifens')
    .transform((username) => username.toLowerCase()),
})
type FormValues = z.infer<typeof schema>

export function ClaimUsernameForm() {
  const router = useRouter()
  const { formState, handleSubmit, register } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
    },
  })

  const onUsernamePreRegister: SubmitHandler<FormValues> = useCallback(
    async (data) => {
      await router.push(`/register?username=${data.username}`)
    },
    [router],
  )

  return (
    <>
      <Form as="form" onSubmit={handleSubmit(onUsernamePreRegister)}>
        <TextInput
          size="sm"
          prefix="ignite.com/"
          placeholder="seu-usuario"
          {...register('username')}
        />

        <Button size="sm" type="submit" disabled={formState.isSubmitting}>
          Reservar
          <ArrowRight />
        </Button>
      </Form>
      <FormAnnotation>
        <Text size="sm">
          {formState.errors.username
            ? formState.errors.username.message
            : 'Digite o nome do usuário desejado'}
        </Text>
      </FormAnnotation>
    </>
  )
}
