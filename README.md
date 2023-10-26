# Ignite-Call

## Projeto voltado a integração do google agenda para verificação de disponibilidade de tempo. Utilizando ReactJS, TypeScript, NextJS, Designer System.

## Basicamente o usuário faz authenticação oauth no sistema, utilizando o google e habilitando as permissões para acesso a API de calendário da sua conta do google. Dessa forma, o usuário é capaz de marcar as disponibilidades de tempo para os dias selecionados.

## Start Project

required nodejs > 12 version.

install dependencias

<aside>
💡 npm install

</aside>

start project

<aside>
💡 npm run dev

</aside>

start studio view 

<aside>
💡 npm run studio

</aside>

build

<aside>
💡 npm run build

</aside>

## Layouts

## Package

## Aula de formulário de disponibilidade:

- utilizandando useFieldArray para criar formulários onde um campo field é um array de objetos, onde cada objeto será um valor de input.
- A motivação é proporcionar melhor experiência e desempenho ao usuário
- documentação: [https://www.react-hook-form.com/api/usefieldarray/](https://www.react-hook-form.com/api/usefieldarray/)

## CheckBox de controle

Aqui a abordagem dessa aula é utilizar control input devido ao fato de que um checkbox não é um input nativo do HTML, ou seja, para campos em que não são nativos, você precisa adicionar um control input.

Documentação: [https://www.react-hook-form.com/api/useform/control/](https://www.react-hook-form.com/api/useform/control/)

<aside>
💡 Controller é um componente do react hook form para controlar input que não são nativos.

</aside>

```
<Controller
  name={`intervals.${index}.enabled`}
  control={control}
  render={({ field }) => (
    <Checkbox
      onCheckedChange={(checked) => {
        field.onChange(checked === true)
      }}
      checked={field.value}
    />
  )}
/>
```

## Validação e controle com zod

Aqui nessa aula integramos o react hook form com a biblioteca zod para trata de dados de erros e validações no nosso formulário. importando z , podemos inferir um objeto ou array de manipulação de saída.

<aside>
💡 Aqui o campo intervals é um array de objetos, nesse caso usamos o código abaixo para tratar como deveria ser a saída no nosso formulário após a validação.

transform transforma os dados de input para saída.
refine ele retorna true ou false para definar o que tem que ser obrigatório dentro dessa tratativada.

</aside>

```
const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .length(7)
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    .refine((intervals) => intervals.length > 0, {
      message: 'Você precisa selecionar pelo menos 1 dia da semana!',
    }),
})
```

## Input e Output com zod

Mais uma transformação com zod de entrada e saída de dados. O segundo método transform vai aplicar uma transformação no formato dos dados após a aplicação de um refine. Basicamente converter os startTime e endTime para minutos.

Em seguida aplica-se um outro refine para validação, verificando se existe algum endTime menor do que o startTime de entrada. Dessa forma. Para integração com typescript, podemos aplicar um  z.input ou z.output para pegar as typagens de entrada e saída usando zod.

```
const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .length(7)
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    .refine((intervals) => intervals.length > 0, {
      message: 'Você precisa selecionar pelo menos 1 dia da semana!',
    })
    .transform((intervals) =>
      intervals.map((interval) => {
        return {
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeToMinutes(interval.startTime),
          endTimeInMinute: convertTimeToMinutes(interval.endTime),
        }
      }),
    )
    .refine(
      (intervals) => {
        return intervals.every(
          (interval) =>
            interval.endTimeInMinute - 60 >= interval.startTimeInMinutes,
        )
      },
      {
        message:
          'O horário de término deve ser pelo menos 1h distante do inicio.',
      },
    ),
})

type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema>
type TimeIntervalsFormOutOutput = z.output<typeof timeIntervalsFormSchema>
```

## Rotas autenticadas no next

Caso você precise capturar os dados da sessão do usuário logado em uma API, seja para cadastrar uma informação ou buscar, você pode aplicar um método getServerSession dentro do server side, passando o request, response e os authOptions.

```
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const session = await getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res),
  )

  return res.json({
    session,
  })
}
```

## Criação de dias de disponibilidade

Nesse tópico é introduzido a criação no banco dos horários disponíveis do usuário durante a semana. Para isso foi necessário ciar uma nova tabela no prisma studio, com o seguinte model.

```
model UserTimeInterval {
  id                    String @id @default(uuid())
  week_day              Int
  time_start_in_minutes Int
  time_end_in_minutes   Int

  user    User   @relation(fields: [user_id], references: [id])
  user_id String

  @@map("user_time_interval")
}
```

Em seguida, capturando os dados do body para cadastro de cada dia selecionado pelo usuário. Infelizmente não é possível no sqLite realizar um createMany para cadastro dos dias dentro de array, para isso usamos o método Promise.All.

```
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const session = await getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res),
  )

  if (!session) {
    return res.status(401).end()
  }

  const { intervals } = requestBodySchema.parse(req.body)

  await Promise.all(
    intervals.map((interval) => {
      return prisma.userTimeInterval.create({
        data: {
          time_end_in_minutes: interval.startTimeInMinutes,
          time_start_in_minutes: interval.endTimeInMinute,
          week_day: interval.weekDay,
          user_id: session.user?.id,
        },
      })
    }),
  )

  return res.status(201).end()
}
```

## Página de atualizar perfil

Para esse tópico usamos o useSession do next para capturar informações do usuário authenticado no sistema. Porém, em um primeiro momento, os dados da sessão do usuário aparecem undefined e em seguida preenchidos. Isso é devido ao fato que o contexto do provider envia para páginas as propriedades da sessão, mas com elas undefined, porque é necessário realizar uma busca de dados para obter as informações do usuário authenticado. 

Dessa forma, adicionamos um getServerSideProps para a página, capturando de dentro de req e res, usando o método getServerSession do lado do server side os dados do usuário e em seguido enviando através das propriedades para página. Tudo isso, implica que no console.log os dados já estiverem carregados em um primeiro momento. 

```
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res),
  )

  return {
    props: {
      session,
    },
  }
}
```

```
const session = useSession()

  console.log(session)
```

## Página de agendamento

Para criação dessa página inicialmente, escrevemos um método getStaticProps que é o método de pré-renderização que gera o HTML no **momento da construção** . O HTML pré-renderizado é então *reutilizado* em cada solicitação.

### Quando usar [geração estática](https://nextjs.org/docs/basic-features/pages#static-generation-recommended) versus [renderização no lado do servidor](https://nextjs.org/docs/basic-features/pages#server-side-rendering)

Recomendamos usar **[a Geração Estática](https://nextjs.org/docs/basic-features/pages#static-generation-recommended)** (com e sem dados) sempre que possível porque sua página pode ser construída uma vez e servida por CDN, o que a torna muito mais rápida do que ter um servidor renderizando a página em cada solicitação.

Você pode usar [a geração estática](https://nextjs.org/docs/basic-features/pages#static-generation-recommended) para muitos tipos de páginas, incluindo:

- Páginas de marketing
- Postagens no blog
- Listagens de produtos de comércio eletrônico
- Ajuda e documentação

Você deve se perguntar: "Posso pré-renderizar esta página **antes** da solicitação do usuário?" Se a resposta for sim, você deve escolher [Geração Estática](https://nextjs.org/docs/basic-features/pages#static-generation-recommended) .

Por outro lado, [a geração estática](https://nextjs.org/docs/basic-features/pages#static-generation-recommended) **não** é uma boa ideia se você não puder pré-renderizar uma página antes da solicitação do usuário. Talvez sua página mostre dados atualizados com frequência e o conteúdo da página mude a cada solicitação.

Nesse caso, você pode usar **[a renderização do lado do servidor](https://nextjs.org/docs/basic-features/pages#server-side-rendering)** . Será mais lento, mas a página pré-renderizada estará sempre atualizada. Ou você pode pular a pré-renderização e usar JavaScript do lado do cliente para preencher dados atualizados com frequência.

Nessa abordagem usamos getStaticProps com dados, fazendo uma solicitação ao banco de dados para gerar dados para nossa página estática.

```
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const username = String(params?.username)

  const user = await prisma.user.findUnique({ where: { username } })

  if (!user) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      user: {
        name: user.username,
        bio: user.bio,
        avatarUrl: user.avatar_url,
      },
    },
    revalidate: 60 * 60 * 24, // 1day
  }
}
```

Nesse caso, temos uma revalidação de 1 dia, ou seja, para cada dia o next executará novamente essa página renovando os dados pre processados do nosso banco de dados. 

Porém, note que nossa funçaõ getStaticProps usa um parametro dinâmico vindo da URL. Se uma página possui [Rotas Dinâmicas](https://nextjs.org/docs/pages/building-your-application/routing/dynamic-routes) e usa `getStaticProps`, ela precisa definir uma lista de caminhos a serem gerados estaticamente.

Quando você exporta uma função chamada `getStaticPaths`(Geração de site estático) de uma página que usa rotas dinâmicas, Next.js pré-renderizará estaticamente todos os caminhos especificados por `getStaticPaths`.

A `[getStaticPaths`referência da API](https://nextjs.org/docs/pages/api-reference/functions/get-static-paths) abrange todos os parâmetros e adereços que podem ser usados com o `getStaticPaths`.

```
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}
```

Para esse caso, para paths vazio, temos que todas as páginas serão geradas durante a construção no processo de build. fallback: ‘Blocking’  é chamada antes da renderização da página. Para esse caso é útil quando temos muitas páginas estáticas que requerem dados vindo dos parametros. 

## Navegando nos meses

Para adicionar a funcionalidade de navegação do calendário para página de agendamento, tivemos que lidar com datas no javascript, criando um estado que vai armazenar essa data. Porém, para lidar com manipulação, tivemos que instalar a biblioteca dayjs para manipular a data.

<aside>
💡 A arrow function retorna o valor da data atual, passando em set o segundo parâmetro como sendo 1, porque sempre vamos lidar com o primeiro dia do mês.

Em seguida, introduzimos duas funções que vão diminuir ou aumentar a data em 30 dias ou em um mês. 

Em seguida, formatamos para exibir na página o valor do ano e mês correspondente.

</aside>

```
const [currentDate, setCurrentDate] = useState(() => {
    return dayjs().set('date', 1)
  })

  function handlePreviousMonth() {
    const previousMonthDate = currentDate.subtract(1, 'month')

    setCurrentDate(previousMonthDate)
  }

  function handleNextMonth() {
    const nextMonthDate = currentDate.add(1, 'month')

    setCurrentDate(nextMonthDate)
  }

  const shortWeekDays = getWeekDays({ short: true })

  const currentMonth = currentDate.format('MMMM')
  const currentYear = currentDate.format('YYYY')
```

Além disso, precisamos transformar a formatação para o linguagem portuguesa. 

<aside>
💡 Criamos um arquivo dayjs.ts e importamos na raiz do projeto, para sempre exportar a data no formato PT-BR

</aside>

```
import dayjs from 'dayjs'

import 'dayjs/locale/pt-br'

dayjs.locale('pt-br')
```

## Dias do calendário

Através de uma função usando useMemo, criamos uma lógica para capturar os dias dos mês anterior e os dias do mês posterior para montagem do calendário. Em seguida, tratamos o dado usando um slice para capturar os dias daquela semana.

```
const calendarWeeks = useMemo(() => {
    const daysInMonthArray = Array.from({
      length: currentDate.daysInMonth(),
    }).map((_, i) => {
      return currentDate.set('date', i + 1)
    }) // days in month

    const firstWeekDay = currentDate.get('day') // return first day in month

    const previousMonthsFillArray = Array.from({
      length: firstWeekDay,
    }) // create array with length that days missing
      .map((_, i) => {
        return currentDate.subtract(i + 1, 'day')
      }) // create array with values of days missing
      .reverse() // reverse the array

    const lastDayInCurrentMonth = currentDate.set(
      'date',
      currentDate.daysInMonth(),
    ) // last day in month

    const lastWeekDay = lastDayInCurrentMonth.get('day') // day the last week of the month

    const nextMonthFillArray = Array.from({
      length: 7 - (lastWeekDay + 1), // create array with length that days next days in next month
    }).map((_, i) => {
      return lastDayInCurrentMonth.add(i + 1, 'day') // create array with values of next days
    })

    const calendarDays = [
      ...previousMonthsFillArray.map((date) => {
        return { date, disabled: true }
      }),
      ...daysInMonthArray.map((date) => {
        return { date, disabled: false }
      }),
      ...nextMonthFillArray.map((date) => {
        return { date, disabled: true }
      }),
    ] // array with total days in month

    const calendarWeeks = calendarDays.reduce<CalendarWeeks>(
      (weeks, _, i, original) => {
        const isNewWeek = i % 7 === 0 // if start new week

        if (isNewWeek) {
          weeks.push({
            week: i / 7 + 1,
            days: original.slice(i, i + 7), // added day in week
          })
        }

        return weeks
      },
      [],
    )

    return calendarWeeks
  }, [currentDate])

```

## Exibição de dias disponíves

Primeiramente vamos precisar de uma rota para buscar os horários disponíveis do usuário e os horários agendados para cada dia específico. Após o clique do usuário em algum dia do calendário, uma busca deve ser realizada no banco de dados para buscar os horário disponíveis.

Primeiro verificar se foi passada uma data pela roda.

```
const username = String(req.query.username)
  const { date } = req.query

  if (!date) {
    return res.status(400).json({ message: 'Date not provided.' })
  }
```

Verificar se o usuário existe no banco de dados, passando seu username

```
const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user) {
    return res.status(400).json({ message: 'user does not exist.' })
  }
```

Caso a data selecionada seja a data anterior a atual, devemos retornar vazio.

```
const referenceDate = dayjs(String(date))
  const isPastDate = referenceDate.endOf('day').isBefore(new Date())

  if (isPastDate) {
    return res.json({ possibleTimes: [], availableTimes: [] })
  }
```

Caso seja uma data válida posterior ou igual a data atual, devemos buscar no banco os intervalos de horários disponíveis daquele usuário no dia selecionado. Caso não tenha horários ou registro no banco, retorne vazio.

```
const userAvailability = await prisma.userTimeInterval.findFirst({
    where: {
      user_id: user.id,
      week_day: referenceDate.get('day'),
    },
  })

  if (!userAvailability) {
    return res.json({ possibleTimes: [], availableTimes: [] })
  }
```

Caso existe, transoformando o tempo de minutos para horas, podemos gerar um array da hora inicial para hora final disponível do usuário. O problema é se tiver um horário entre o inicial e final que esteja indisponivel. Para isso, realizamos outra busca no banco na tabela scheduling para buscar os dias agendados do usuário e realizar um cruzamento de dados, filtrando de possibleTimes os horários disponíveis.

```
const { time_end_in_minutes, time_start_in_minutes } = userAvailability

  const endHour = time_end_in_minutes / 60
  const startHour = time_start_in_minutes / 60

  const possibleTimes = Array.from({ length: endHour - startHour }).map(
    (_, i) => {
      return startHour + i
    },
  )

  const blockedTimes = await prisma.scheduling.findMany({
    select: {
      date: true,
    },
    where: {
      user_id: user.id,
      date: {
        gte: referenceDate.set('hour', startHour).toDate(),
        lte: referenceDate.set('hour', endHour).toDate(),
      },
    },
  })

  const availableTimes = possibleTimes.filter((time) => {
    return !blockedTimes.some(
      (blockedTime) => blockedTime.date.getHours() === time,
    )
  })

  return res.json({
    possibleTimes,
    availableTimes,
  })
```

Com essa rota finalizada, após a seleção de uma data, podemos chamar a rota no componente e mostrar os intervalos de dados disponíveis e indiponíveis.

## Depedências

- React Hook Form
- ReactJS
- NextJS e Next Auth
- Zod
- Prisma
- Nookies
- Phosphor-react
- Axios