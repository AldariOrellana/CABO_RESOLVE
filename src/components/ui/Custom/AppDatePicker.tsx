import { useMemo, useState } from 'react';

import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';

interface AppDatePickerProps {
  label?: string;
  value: string | null;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function formatDate(year: number, month: number, day: number) {
  return [
    String(year).padStart(4, '0'),
    String(month + 1).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-');
}

function parseDate(value: string | null): Date {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(year, month - 1, day);

    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day
    ) {
      return parsed;
    }
  }

  return new Date();
}

export function AppDatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Seleccione una fecha',
  error,
  required = false,
  disabled = false,
}: AppDatePickerProps) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);

  const initialDate = parseDate(value);
  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const offset = (firstDay + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();

    return [
      ...Array.from({ length: offset }, () => null),
      ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ];
  }, [year, month]);

  const changeMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  const openCalendar = () => {
    const date = parseDate(value);
    setYear(date.getFullYear());
    setMonth(date.getMonth());
    setOpen(true);
  };

  const dateLabel = value
    ? (() => {
        const date = parseDate(value);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(
          2,
          '0',
        )}/${date.getFullYear()}`;
      })()
    : placeholder;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
          {required && <Text style={{ color: colors.danger }}> *</Text>}
        </Text>
      )}

      <Pressable
        onPress={openCalendar}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        style={[
          styles.field,
          {
            backgroundColor: colors.input,
            borderColor: error ? colors.danger : colors.border,
            opacity: disabled ? 0.55 : 1,
          },
        ]}
      >
        <Ionicons name="calendar-outline" size={21} color={colors.textSecondary} />

        <Text
          style={{
            flex: 1,
            fontSize: 15,
            color: value ? colors.text : colors.placeholder,
          }}
        >
          {dateLabel}
        </Text>

        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>

      {!!error && <Text style={{ color: colors.danger, fontSize: 12 }}>{error}</Text>}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />

          <View style={[styles.dialog, { backgroundColor: colors.card }]}>
            <View style={styles.heading}>
              <Pressable
                onPress={() => changeMonth(-1)}
                accessibilityLabel="Mes anterior"
                hitSlop={10}
              >
                <Ionicons name="chevron-back" size={24} color={colors.primary} />
              </Pressable>

              <Text
                style={{
                  color: colors.text,
                  fontSize: 17,
                  fontWeight: '700',
                }}
              >
                {MONTHS[month]} {year}
              </Text>

              <Pressable
                onPress={() => changeMonth(1)}
                accessibilityLabel="Mes siguiente"
                hitSlop={10}
              >
                <Ionicons name="chevron-forward" size={24} color={colors.primary} />
              </Pressable>
            </View>

            <View style={styles.calendar}>
              {WEEKDAYS.map((day, index) => (
                <View key={index} style={styles.dayCell}>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: colors.textSecondary,
                      fontWeight: '600',
                    }}
                  >
                    {day}
                  </Text>
                </View>
              ))}

              {days.map((day, index) => {
                if (day === null) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const date = formatDate(year, month, day);
                const selected = date === value;
                const outOfRange =
                  (minDate !== undefined && date < minDate) ||
                  (maxDate !== undefined && date > maxDate);

                return (
                  <View key={date} style={styles.dayCell}>
                    <Pressable
                      disabled={outOfRange}
                      onPress={() => {
                        onChange(date);
                        setOpen(false);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={date}
                      accessibilityState={{
                        selected,
                        disabled: outOfRange,
                      }}
                      style={[
                        styles.dayButton,
                        {
                          backgroundColor: selected ? colors.primary : 'transparent',
                          opacity: outOfRange ? 0.3 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: selected ? colors.onPrimary : colors.text,
                          fontWeight: selected ? '700' : '400',
                        }}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            <Pressable onPress={() => setOpen(false)} style={styles.closeButton}>
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: '600',
                }}
              >
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 7,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  field: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 18,
    padding: 16,
  },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  dayCell: {
    width: '14.285714%',
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButton: {
    width: 37,
    height: 37,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 14,
    marginTop: 10,
  },
});
