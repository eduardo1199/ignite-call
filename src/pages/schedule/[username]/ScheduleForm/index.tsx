import { CalendarStep } from './CalendarStep'
import { useState } from 'react'
import { ConfirmStep } from './ConfirmStep'

export function ScheduleForm() {
  const [selectDateTime, setSelectDateTime] = useState<Date | null>(null)

  function handleClearSelectDateTime() {
    setSelectDateTime(null)
  }

  if (selectDateTime) {
    return (
      <ConfirmStep
        schedulingDate={selectDateTime}
        onCancelConfirmation={handleClearSelectDateTime}
      />
    )
  }

  return <CalendarStep onSelectDateTime={setSelectDateTime} />
}
