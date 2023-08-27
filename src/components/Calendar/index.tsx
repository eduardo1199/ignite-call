import { CaretLeft, CaretRight } from 'phosphor-react'
import {
  CalendarActions,
  CalendarBody,
  CalendarContainer,
  CalendarDay,
  CalendarHeader,
  CalendarTitle,
} from './styles'
import { getWeekDays } from 'utils/get-week-days'

export function Calendar() {
  const shortWeekDays = getWeekDays({ short: true })

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>
          Dezembro <span>2022</span>
        </CalendarTitle>
      </CalendarHeader>

      <CalendarActions>
        <button>
          <CaretLeft />
        </button>
        <button>
          <CaretRight />
        </button>
      </CalendarActions>

      <CalendarBody>
        <thead>
          <tr>
            {shortWeekDays.map((weekDay) => {
              return <th key={weekDay}>{weekDay}.</th>
            })}
            <tbody>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <CalendarDay>1</CalendarDay>
                </td>
                <td>
                  <CalendarDay>2</CalendarDay>
                </td>
                <td>
                  <CalendarDay>3</CalendarDay>
                </td>
              </tr>
            </tbody>
          </tr>
        </thead>
      </CalendarBody>
    </CalendarContainer>
  )
}
