import { Calendar } from 'components/Calendar'
import {
  Container,
  TimePicker,
  TimePickerHeader,
  TimePickerItem,
  TimePickerList,
} from './styles'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { api } from 'lib/axios'

interface Availability {
  possibleTimes: number[]
  availableTimes: number[]
}

export function CalendarStep() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availability, setAvailability] = useState<Availability | null>(null)

  const router = useRouter()

  const username = String(router.query.username)

  const isDateSelected = !!selectedDate

  const weekDay = selectedDate ? dayjs(selectedDate).format('dddd') : null
  const currentDateLabel = selectedDate
    ? dayjs(selectedDate).format('DD[ de ]MMMM')
    : null

  function handleOnSelectedDate(date: Date) {
    setSelectedDate(date)
  }

  useEffect(() => {
    if (selectedDate) {
      api
        .get(`/users/${username}/availability`, {
          params: {
            date: dayjs(selectedDate).format('YYYY-MM-DD'),
          },
        })
        .then((response) => {
          setAvailability(response.data)
        })
    }
  }, [selectedDate, username])

  return (
    <Container isTimePickerOpen={isDateSelected}>
      <Calendar
        selectedDate={selectedDate}
        onDateSelected={handleOnSelectedDate}
      />

      {isDateSelected && (
        <TimePicker>
          <TimePickerHeader>
            {weekDay} <span>{currentDateLabel}</span>
          </TimePickerHeader>

          <TimePickerList>
            {availability?.possibleTimes.map((hour) => {
              return (
                <TimePickerItem
                  key={hour}
                  disabled={!availability?.availableTimes.includes(hour)}
                >
                  {String(hour).padStart(2, '0')}:00h
                </TimePickerItem>
              )
            })}
          </TimePickerList>
        </TimePicker>
      )}
    </Container>
  )
}
