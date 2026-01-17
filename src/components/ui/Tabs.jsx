import React, { useState, createContext, useContext } from "react";
import { cn } from "../../utils/cn";
import { motion, AnimatePresence } from "framer-motion";

const TabsContext = createContext({});

const Tabs = ({
  defaultValue,
  className,
  children,
  onValueChange,
  ...props
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleValueChange = (newValue) => {
    setValue(newValue);
    if (onValueChange) onValueChange(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, setValue: handleValueChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ className, children, ...props }) => (
  <div
    className={cn(
      "inline-flex h-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 p-1 text-slate-500 dark:text-slate-400 w-full",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const TabsTrigger = ({ value, className, children, ...props }) => {
  const { value: selectedValue, setValue } = useContext(TabsContext);
  const isSelected = selectedValue === value;

  return (
    <button
      className={cn(
        "relative inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "text-slate-950 dark:text-white"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200",
        className
      )}
      onClick={() => setValue(value)}
      {...props}
    >
      {isSelected && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-white dark:bg-slate-600 rounded-md shadow-sm border border-slate-200 dark:border-slate-500"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

const TabsContent = ({ value, className, children, ...props }) => {
  const { value: selectedValue } = useContext(TabsContext);

  if (value !== selectedValue) return null;

  return (
    <motion.div
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
