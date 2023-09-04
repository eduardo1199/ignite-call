import { Button, Text, TextArea, TextInput } from '@ignite-ui/react'
import { ConfirmForm, FormAction, FormHeader } from './styles'
import { CalendarBlank, Clock } from 'phosphor-react'

export function ConfirmStep() {
  function handleConfirmScheduling() {}

  return (
    <ConfirmForm as="form" onSubmit={handleConfirmScheduling}>
      <FormHeader>
        <Text>
          <CalendarBlank />
          22 de Setembro de 2022
        </Text>
        <Text>
          <Clock />
          18:00h
        </Text>
      </FormHeader>

      <label htmlFor="">
        <Text size="sm">Nome Completo</Text>
        <TextInput placeholder="Seu nome" />
      </label>

      <label htmlFor="">
        <Text size="sm">Endereço de e-mail</Text>
        <TextInput type="email" placeholder="jonhdoe@exemple.com" />
      </label>

      <label htmlFor="">
        <Text size="sm">Observações</Text>
        <TextArea />
      </label>

      <FormAction>
        <Button type="button" variant="tertiary">
          Cancelar
        </Button>

        <Button type="submit">Confirmar</Button>
      </FormAction>
    </ConfirmForm>
  )
}
