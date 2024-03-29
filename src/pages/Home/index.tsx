import type { NextPage } from 'next'
import { Container, Hero, Preview } from './styles'
import { Heading, Text } from '@ignite-ui/react'
import Image from 'next/image'

import previewImage from 'assets/calendar.png'
import { ClaimUsernameForm } from './components/ClaimUsernameForm'
import { NextSeo } from 'next-seo'

const Home: NextPage = () => {
  return (
    <>
      <NextSeo
        title="Descomplique sua agenda - Ignite Call"
        description="Conecte seu calendário e permita que as pessoas marquem agendamentos
        no seu tempo livre."
      />

      <Container>
        <Hero>
          <Heading size="4xl">Agendamento descomplicado</Heading>
          <Text size="xl">
            Conecte seu calendário e permita que as pessoas marquem agendamentos
            no seu tempo livre.
          </Text>

          <ClaimUsernameForm />
        </Hero>

        <Preview>
          <Image
            src={previewImage}
            alt="calendário simbolizando aplicação em funcionamento"
            height={400}
            quality={100}
            priority
          />
        </Preview>
      </Container>
    </>
  )
}

export default Home
