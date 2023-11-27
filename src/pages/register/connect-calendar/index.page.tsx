import { Button, Heading, MultiStep, Text } from '@ignite-ui/react'
import { Container, Header } from '../styles'
import { ArrowRight, Check } from 'phosphor-react'
import { AuthError, ConnectBox, ConnectItem } from './styles'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { FormEvent } from 'react'
import { NextSeo } from 'next-seo'

export default function ConnectCalendar() {
  const session = useSession()
  const router = useRouter()

  const hasAuthError = !!router.query.error
  const isSignedIn = session.status === 'authenticated'

  async function handleConnectCalendar() {
    await signIn('google')
  }

  function handleNavigatorSubmit(e: FormEvent) {
    e.preventDefault()

    router.push('/register/time-intervals')
  }

  return (
    <>
      <NextSeo title="Conecte sua agenda do Google - Ignite Call" noindex />

      <Container>
        <Header>
          <Heading as="strong">Bem-vindo ao Ignite Call!</Heading>
          <Text>
            Conecte o seu calendário para verificar automaticamente as horas
            ocupadas e os novos eventos à medida em que são agendados.
          </Text>

          <MultiStep size={4} currentStep={2} />

          <ConnectBox as="form" onSubmit={handleNavigatorSubmit}>
            <ConnectItem>
              <Text>Google Calendar</Text>
              {isSignedIn ? (
                <Button size="sm" disabled>
                  Conectado
                  <Check />
                </Button>
              ) : (
                <Button variant="secondary" onClick={handleConnectCalendar}>
                  Conectar <ArrowRight />
                </Button>
              )}
            </ConnectItem>

            {hasAuthError && (
              <AuthError size="sm">
                Falha ao se conectar ao Google, verifique se você habilitou as
                permissões de acesso ao Google Calendar.
              </AuthError>
            )}

            <Button type="submit" disabled={!isSignedIn}>
              Próximo passo
              <ArrowRight />
            </Button>
          </ConnectBox>
        </Header>
      </Container>
    </>
  )
}
