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

interface CalendarStepProps {
  onSelectDateTime: (date: Date) => void;
}

export function CalendarStep({ onSelectDateTime }: CalendarStepProps) {
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

  const handleSelectTime = (hour: number) => {
    if (selectedDate) {
      const dateWithTime = dayjs(selectedDate)
        .set("hour", hour)
        .startOf("hour")
        .toDate();
      onSelectDateTime(dateWithTime);
    }
  };

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
                  onClick={() => handleSelectTime(hour)}
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
