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

## Depedências

- React Hook Form
- ReactJS
- NextJS e Next Auth
- Zod
- Prisma
- Nookies
- Phosphor-react
- Axios