import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput,
} from "@ignite-ui/react";
import { ArrowRight } from "phosphor-react";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { z } from "zod";
import { getWeekDays } from "../../../utils/get-week-days";
import { Container, Header } from "../styles";
import {
  IntervalBox,
  IntervalDay,
  IntervalInputs,
  IntervalItem,
  IntervalsContainer,
} from "./styles";

const timeIntervalsFormSchema = z.object({
  intervals: z.array(
    z.object({
      weekDay: z.number().min(0).max(6),
      enabled: z.boolean(),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
    })
  ),
});
type FormProps = z.infer<typeof timeIntervalsFormSchema>;

export default function TimeIntervals() {
  const { register, handleSubmit, formState, control, watch } =
    useForm<FormProps>({
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

  const handleSetTimeIntervals: SubmitHandler<FormProps> = () => {
    console.log("oi");
  };

  return (
    <Container>
      <Header>
        <Heading as="strong">Quase lá</Heading>

        <Text>
          Defina o intervalo de horários que você está disponível em cada dia da
          semana.
        </Text>

        <MultiStep size={4} currentStep={3} />
      </Header>

      <IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
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

        <Button type="submit" disabled={formState.isSubmitting}>
          Próximo passo
          <ArrowRight />
        </Button>
      </IntervalBox>
    </Container>
  );
}
