import { zodResolver } from '@hookform/resolvers/zod'
import { Button, TextInput } from '@ignite-ui/react'
import { ArrowRight } from 'phosphor-react'
import { useCallback } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form } from './styles'

const schema = z.object({
  username: z.string().min(3).max(20),
})
type FormValues = z.infer<typeof schema>

export function ClaimUsernameForm() {
  const { formState, handleSubmit, register } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
    },
  })

  const onUsernamePreRegister: SubmitHandler<FormValues> = useCallback(
    async (data) => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log(data)
    },
    [],
  )

  return (
    <Form as="form" onSubmit={handleSubmit(onUsernamePreRegister)}>
      <TextInput
        size="sm"
        prefix="ignite.com/"
        placeholder="Seu usuário"
        {...register('username')}
      />

      <Button size="sm" type="submit" disabled={formState.isSubmitting}>
        Reservar
        <ArrowRight />
      </Button>
    </Form>
  )
}
