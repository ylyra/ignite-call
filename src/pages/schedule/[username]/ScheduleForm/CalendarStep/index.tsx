import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";
import { Calendar } from "../../../../../components/Calendar";
import { api } from "../../../../../lib/axios";
import {
  Container,
  TimePicker,
  TimePickerHeader,
  TimePickerItem,
  TimePickerList,
} from "./style";

interface Availability {
  possibleTimes: number[];
  availableTimes: number[];
}

export function CalendarStep() {
  const router = useRouter();
  const username = String(router.query.username);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const isDateSelected = !!selectedDate;
  const selectedDateWithoutTime = selectedDate
    ? dayjs(selectedDate).format("YYYY-MM-DD")
    : null;
  const { data: availability } = useQuery(
    ["availability", selectedDateWithoutTime, username],
    async () => {
      const response = await api.get<Availability>(
        `/users/${username}/availability`,
        {
          params: {
            date: selectedDateWithoutTime,
          },
        }
      );

      return response.data;
    },
    {
      enabled: !!selectedDate,
    }
  );

  const weekDay = selectedDate ? dayjs(selectedDate).format("dddd") : null;
  const describredDate = selectedDate
    ? dayjs(selectedDate).format("DD[ de ]MMMM")
    : null;

  return (
    <Container isTimePickerOpen={isDateSelected}>
      <Calendar selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {isDateSelected && (
        <TimePicker>
          <TimePickerHeader>
            {weekDay} <span>{describredDate}</span>
          </TimePickerHeader>

          <TimePickerList>
            {availability?.possibleTimes.map((hour) => {
              return (
                <TimePickerItem
                  key={`hour-${hour}`}
                  disabled={!availability.availableTimes.includes(hour)}
                >
                  {String(hour).padStart(2, "0")}:00
                </TimePickerItem>
              );
            })}
          </TimePickerList>
        </TimePicker>
      )}
    </Container>
  );
}
