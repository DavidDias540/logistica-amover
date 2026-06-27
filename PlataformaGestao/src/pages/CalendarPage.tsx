import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { apiClient } from "../api/client";

const CalendarPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  React.useEffect(() => {
    async function loadTasks() {
      try {
        const { data } = await apiClient.get("/api/Task");
        setTasks(data || []);
      } catch (error) {
        console.error("Error loading tasks", error);
      }
    }
    loadTasks();
  }, []);

  const eventsByDay: Record<number, any[]> = tasks.reduce((acc, t) => {
    const rawDateStr = t.deadline || t.creationDate;
    const dt = new Date(rawDateStr || new Date());

    if (
      dt.getMonth() === currentDate.getMonth() &&
      dt.getFullYear() === currentDate.getFullYear()
    ) {
      const day = dt.getDate();
      if (!acc[day]) acc[day] = [];

      const assigned = t.motorcycleid !== null || t.VehicleId !== null;

      acc[day].push({
        ...t,
        assignedTo: assigned,
      });
    }
    return acc;
  }, {} as Record<number, any[]>);

  // ----------------------------
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const handlePrevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );

  const handleNextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  // ----------------------------
  const renderDay = (day: number) => {
    const events = eventsByDay[day];

    return (
      <div
        onClick={() => setSelectedDay(day)}
        className="h-20 border border-gray-200 dark:border-gray-700 p-1 relative cursor-pointer hover:bg-gray-50 dark:bg-gray-700/50"
      >
        <span className="text-sm">{day}</span>

        {events && (
          <div className="absolute bottom-1 left-1 flex gap-0.5 flex-wrap">
            {events.slice(0, 3).map((ev: any) => (
              <div
                key={ev.id || ev.Id}
                className={`w-2 h-2 rounded-full
                  ${
                    (ev.priority || ev.Priority) === "ALTA"
                      ? "bg-red-500"
                      : (ev.priority || ev.Priority) === "MÉDIA"
                      ? "bg-orange-500"
                      : "bg-green-500"
                  }
                  ${ev.assignedTo ? "ring-2 ring-blue-400" : ""}
                `}
              />
            ))}
            {events.length > 3 && (
              <div className="w-2 h-2 rounded-full bg-gray-400" />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* HEADER */}
      <div className="flex items-center justify-between p-3 border-b">
        <button onClick={handlePrevMonth}>
          <ChevronLeft />
        </button>
        <h2 className="text-lg font-semibold capitalize">
          {currentDate.toLocaleString("pt-PT", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button onClick={handleNextMonth}>
          <ChevronRight />
        </button>
      </div>

      {/* GRID */}
      <div className="p-3 grid grid-cols-7 text-center font-semibold text-sm text-gray-600 dark:text-gray-300">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* DAYS */}
      <div className="grid grid-cols-7 flex-1">
        {[...Array(firstDayOfMonth)].map((_, i) => (
          <div key={i} className="h-20 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => (
          <React.Fragment key={i}>{renderDay(i + 1)}</React.Fragment>
        ))}
      </div>

      {/* LEGENDA */}
      <div className="p-2 border-t text-xs flex justify-center gap-4">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500"></div> Alta
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div> Média
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div> Baixa
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full ring-2 ring-blue-400 bg-transparent"></div> Atribuída
        </div>
      </div>

      {/* MODAL INFO */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-4">
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="font-semibold">
                Eventos do dia {selectedDay}
              </h3>
              <button onClick={() => setSelectedDay(null)}>
                <X />
              </button>
            </div>

            {eventsByDay[selectedDay] ? (
              <div className="space-y-3">
                {eventsByDay[selectedDay].map((ev: any) => (
                  <div key={ev.id || ev.Id} className="border-b pb-2">
                    <h4 className="font-medium">{ev.type || ev.description || "Sem título"}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {[ev.street, ev.door_number, ev.city].filter(Boolean).join(", ") || "Sem morada"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{ev.availableTimeStart || ev.availableTimeEnd || "Sem hora"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-300">
                Sem eventos neste dia
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
