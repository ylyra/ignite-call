import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput,
} from "@ignite-ui/react";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { ArrowRight } from "phosphor-react";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { z } from "zod";
import { api } from "../../../lib/axios";
import { convertTimeStringToMinutes } from "../../../utils/convert-time-string-to-minutes";
import { getWeekDays } from "../../../utils/get-week-days";
import { Container, Header } from "../styles";
import {
  FormError,
  IntervalBox,
  IntervalDay,
  IntervalInputs,
  IntervalItem,
  IntervalsContainer,
} from "./styles";

const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .length(7)
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    .refine((intervals) => intervals.length > 0, {
      message: "Selecione pelo menos um dia da semana",
    })
    .transform((intervals) => {
      return intervals.map((interval) => {
        return {
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
          endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
        };
      });
    })
    .refine(
      (intervals) => {
        return intervals.every(
          (interval) =>
            interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes
        );
      },
      {
        message: "O intervalo de tempo deve ser de no mínimo 1 hora",
      }
    ),
});
type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema>;
type TimeIntervalsFormOutput = z.output<typeof timeIntervalsFormSchema>;

export default function TimeIntervals() {
  const { register, handleSubmit, formState, control, watch } =
    useForm<TimeIntervalsFormInput>({
      resolver: zodResolver(timeIntervalsFormSchema),
      defaultValues: {
        intervals: [
          {
            weekDay: 0,
            enabled: false,
            startTime: "08:00",
            endTime: "18:00",
          },
          {
            weekDay: 1,
            enabled: true,
            startTime: "08:00",
            endTime: "18:00",
          },
          {
            weekDay: 2,
            enabled: true,
            startTime: "08:00",
            endTime: "18:00",
          },
          {
            weekDay: 3,
            enabled: true,
            startTime: "08:00",
            endTime: "18:00",
          },
          {
            weekDay: 4,
            enabled: true,
            startTime: "08:00",
            endTime: "18:00",
          },
          {
            weekDay: 5,
            enabled: true,
            startTime: "08:00",
            endTime: "18:00",
          },
          {
            weekDay: 6,
            enabled: false,
            startTime: "08:00",
            endTime: "18:00",
          },
        ],
      },
    });
  const { fields } = useFieldArray({
    name: "intervals",
    control,
  });
  const intervals = watch("intervals");
  const weekDays = getWeekDays();
  const router = useRouter();

  const handleSetTimeIntervals: SubmitHandler<TimeIntervalsFormInput> = async (
    data
  ) => {
    const { intervals } = data as unknown as TimeIntervalsFormOutput;

    await api.post("/users/time-intervals", { intervals });

    await router.push("/register/update-profile");
  };

  return (
    <Container>
      <NextSeo title="Selecione sua disponibilidade" noindex />
      <Header>
        <Heading as="strong">Quase lá</Heading>

        <Text>
          Defina o intervalo de horários que você está disponível em cada dia da
          semana.
        </Text>

        <MultiStep size={4} currentStep={3} />
      </Header>

      <IntervalBox
        as="form"
        onSubmit={handleSubmit(handleSetTimeIntervals, console.log)}
      >
        <IntervalsContainer>
          {fields.map((field, index) => (
            <IntervalItem key={field.id}>
              <IntervalDay as="label">
                <Controller
                  name={`intervals.${index}.enabled`}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  )}
                />
                <Text>{weekDays[field.weekDay]}</Text>
              </IntervalDay>

              <IntervalInputs>
                <TextInput
                  size="sm"
                  type="time"
                  step={60}
                  {...register(`intervals.${index}.startTime`)}
                  disabled={intervals[index].enabled === false}
                />
                <TextInput
                  size="sm"
                  type="time"
                  step={60}
                  {...register(`intervals.${index}.endTime`)}
                  disabled={intervals[index].enabled === false}
                />
              </IntervalInputs>
            </IntervalItem>
          ))}
        </IntervalsContainer>

        {formState.errors.intervals?.message && (
          <FormError size="sm">{formState.errors.intervals?.message}</FormError>
        )}

        <Button type="submit" disabled={formState.isSubmitting}>
          Próximo passo
          <ArrowRight />
        </Button>
      </IntervalBox>
    </Container>
  );
}
