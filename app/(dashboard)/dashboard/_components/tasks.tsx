"use client";
import {
  motion,
  AnimatePresence,
  useAnimate,
  usePresence,
} from "framer-motion";
import { Task as TaskType } from "../types";
import { ReactNode, useEffect, useState } from "react";
import { FiClock, FiPlus, FiTrash2 } from "react-icons/fi";

export default function Tasks({ tasks }: { tasks: TaskType[] }) {
  console.log(tasks);
  function removeElement() {}
  return (
    <div className="w-full space-y-3">
      <AnimatePresence>
        {tasks?.map((t) => (
          <Task
            removeElement={removeElement}
            id={t.id}
            key={t.id}
            time={t.time_minutes_estimate}
          >
            <div>
              <p className={`text-gray-900 transition-colors`}>{t.task}</p>
              <p className={`text-gray-400  transition-colors`}>
                {t.description}
              </p>
            </div>
          </Task>
        ))}
      </AnimatePresence>
      <Form />
    </div>
  );
}

export const Task = ({
  removeElement,
  id,
  children,
  time,
}: {
  removeElement: () => void;
  id: string;
  children: ReactNode;
  time: number;
}) => {
  const [isPresent, safeToRemove] = usePresence();
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (!isPresent) {
      const exitAnimation = async () => {
        animate(
          "p",
          {
            // color: checked ? "#6ee7b7" : "#fca5a5",
          },
          {
            ease: "easeIn",
            duration: 0.125,
          }
        );
        await animate(
          scope.current,
          {
            scale: 1.025,
          },
          {
            ease: "easeIn",
            duration: 0.125,
          }
        );

        await animate(
          scope.current,
          {
            opacity: 0,
            // x: checked ? 24 : -24,
          },
          {
            delay: 0.75,
          }
        );
        safeToRemove();
      };

      exitAnimation();
    }
  }, [isPresent]);

  return (
    <motion.div
      ref={scope}
      layout
      className="relative flex w-full items-center gap-3 rounded border border-gray-200 bg-white p-3 shadow-sm"
    >
      <>{children}</>
      <div className="ml-auto flex gap-1.5">
        <div className="flex items-center gap-1.5 whitespace-nowrap rounded bg-indigo-50 px-1.5 py-1 text-xs text-indigo-600">
          <FiClock />
          <span>{time} minutes</span>
        </div>
        <button
          onClick={() => removeElement()}
          className="rounded bg-red-50 px-1.5 py-1 text-xs text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
        >
          <FiTrash2 />
        </button>
      </div>
    </motion.div>
  );
};

export const Form = () => {
  const [visible, setVisible] = useState(false);

  const [time, setTime] = useState(15);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [unit, setUnit] = useState<"mins" | "hrs">("mins");

  const handleSubmit = () => {
    if (!text.length) {
      return;
    }

    setTime(15);
    setText("");
    setUnit("mins");
  };

  return (
    <div className="w-full max-w-5xl">
      <AnimatePresence>
        {visible && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="mb-6 w-full rounded border border-gray-200 bg-white shadow-sm overflow-hidden"
          >
            <div className="p-3 space-y-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title of the task"
                className="w-full resize-none rounded bg-gray-50 p-3 text-sm text-gray-900 placeholder-gray-500 caret-gray-900 focus:outline-0 focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Wanna add some description?"
                className="h-24 w-full resize-none rounded bg-gray-50 p-3 text-sm text-gray-900 placeholder-gray-500 caret-gray-900 focus:outline-0 focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    className="w-24 rounded bg-gray-100 px-1.5 py-1 text-sm text-gray-900 focus:outline-0 focus:ring-2 focus:ring-indigo-500"
                    value={time}
                    onChange={(e) => setTime(parseInt(e.target.value))}
                  />
                  <button
                    type="button"
                    onClick={() => setUnit("mins")}
                    className={`rounded px-1.5 py-1 text-xs ${
                      unit === "mins"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
                    }`}
                  >
                    mins
                  </button>
                </div>
                <button
                  type="submit"
                  className="rounded bg-indigo-600 px-1.5 py-1 text-xs text-indigo-50 transition-colors hover:bg-indigo-500"
                >
                  Submit
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      <button
        onClick={() => setVisible((pv) => !pv)}
        className="grid w-full place-content-center rounded-sm border border-gray-200 bg-white py-3 text-lg text-gray-900 transition-colors hover:bg-gray-50 active:bg-white shadow-sm"
      >
        <FiPlus
          className={`transition-transform ${
            visible ? "rotate-45" : "rotate-0"
          }`}
        />
      </button>
    </div>
  );
};
