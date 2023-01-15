import dayjs from "dayjs";
import { CaretLeft, CaretRight } from "phosphor-react";
import { useMemo, useState } from "react";
import { getWeekDays } from "../../utils/get-week-days";
import {
  CalendarActions,
  CalendarBody,
  CalendarContainer,
  CalendarDay,
  CalendarHeader,
  CalendarTitle,
} from "./styles";

interface CalendarWeek {
  week: number;
  days: {
    date: dayjs.Dayjs;
    disabled: boolean;
    hidden: boolean;
  }[];
}

type CalendarWeeks = CalendarWeek[];

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(() => {
    return dayjs().set("date", 1);
  });

  function handlePreviousMonth() {
    setCurrentDate((state) => state.subtract(1, "month"));
  }

  function handleNextMonth() {
    setCurrentDate((state) => state.add(1, "month"));
  }

  const currentMonth = currentDate.format("MMMM");
  const currentYear = currentDate.format("YYYY");

  const calendarWeeks = useMemo(() => {
    const daysInMonthArray = Array.from({
      length: currentDate.daysInMonth(),
    }).map((_, i) => {
      return currentDate.set("date", i + 1);
    });

    const firstWeekDay = currentDate.get("day");

    const previousMonthFillArray = Array.from({
      length: firstWeekDay,
    })
      .map((_, index) => {
        return currentDate.subtract(index + 1, "day");
      })
      .reverse();

    const lastDayInCurrentMonth = daysInMonthArray[daysInMonthArray.length - 1];
    const lastWeekDay = lastDayInCurrentMonth.get("day");
    const nextMonthFillArray = Array.from({
      length: 7 - (lastWeekDay + 1),
    }).map((_, index) => {
      return lastDayInCurrentMonth.add(index + 1, "day");
    });

    const calendarDays = [
      ...previousMonthFillArray.map((date) => ({
        date,
        disabled: true,
        hidden: true,
      })),
      ...daysInMonthArray.map((date) => ({
        date,
        disabled: date.endOf("day").isBefore(dayjs()),
        hidden: false,
      })),
      ...nextMonthFillArray.map((date) => ({
        date,
        disabled: true,
        hidden: true,
      })),
    ];

    const calendarWeeks = calendarDays.reduce<CalendarWeeks>(
      (weeks, _, index, original) => {
        const weekNumber = Math.floor(index / 7);

        if (!weeks[weekNumber]) {
          weeks[weekNumber] = {
            week: weekNumber + 1,
            days: [],
          };
        }

        weeks[weekNumber].days.push(original[index]);

        return weeks;
      },
      []
    );

    return calendarWeeks;
  }, [currentDate]);

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>
          {currentMonth} <span>{currentYear}</span>
        </CalendarTitle>

        <CalendarActions>
          <button onClick={handlePreviousMonth} title="Mês anterior">
            <CaretLeft />
          </button>

          <button onClick={handleNextMonth} title="Próximo mês">
            <CaretRight />
          </button>
        </CalendarActions>
      </CalendarHeader>

      <CalendarBody>
        <thead>
          <tr>
            {getWeekDays({
              short: true,
            }).map((weekDay) => (
              <th key={weekDay}>{weekDay}.</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {calendarWeeks.map((week) => (
            <tr key={week.week}>
              {week.days.map((day) => (
                <td key={day.date.format("YYYY-MM-DD")}>
                  <CalendarDay hidden={day.hidden} disabled={day.disabled}>
                    {day.date.format("D")}
                  </CalendarDay>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </CalendarBody>
    </CalendarContainer>
  );
}
