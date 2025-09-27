/* eslint-disable react-refresh/only-export-components */
import { createContext } from "react";
import { FormProvider, useForm, type UseFormReturn } from "react-hook-form";
import { Outlet } from "react-router";
import { activityCreateSchema, type ActivityCreate } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";

interface ActivityContextType {
  form: UseFormReturn<ActivityCreate>;
}

export const ActivityContext = createContext<ActivityContextType | undefined>(
  undefined
);

export const ActivityProvider = () => {
  const form = useForm<ActivityCreate>({
    resolver: zodResolver(activityCreateSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      code: "",
      date: new Date(),
    },
  });

  return (
    <ActivityContext.Provider
      value={{
        form,
      }}
    >
      <FormProvider {...form}>
        <Outlet />
      </FormProvider>
    </ActivityContext.Provider>
  );
};

import { useContext } from "react";

export const useActivityContext = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error(
      "useActivityContext must be used within an ActivityProvider"
    );
  }
  return context;
};
