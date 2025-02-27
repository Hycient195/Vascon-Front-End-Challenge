"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select";
import { FaRegUser } from "react-icons/fa";
import { TbAdjustmentsHorizontal, TbFlag, TbFilter, TbTags, TbCalendarTime, TbCheckbox } from "react-icons/tb";
import { RiRobot2Line } from "react-icons/ri";
import { BsThreeDots } from "react-icons/bs";
import { HiOutlineClipboardList } from "react-icons/hi";
import { MdOutlineDateRange, MdOutlineUpdate, MdCheckBoxOutlineBlank } from "react-icons/md";
import { FiLink, FiBell } from "react-icons/fi";
import { Checkbox } from "@/app/_components/ui/checkbox";

interface IFilterValue {
  text: string;
  value: string;
  icon?: JSX.Element;
  forMultiple?: boolean;
}

interface IFilterItem {
  category: IFilterValue;
  operators: IFilterValue[];
  assignableValues: IFilterValue[];
  canSelectMultiple?: boolean;
}

type IFiltersCategory = Record<string, IFilterItem>;

interface IFilters {
  ai: IFiltersCategory;
  status: IFiltersCategory;
  issue: IFiltersCategory;
  dates: IFiltersCategory;
  misc: IFiltersCategory;
}

interface ISelectedFilter {
  filterKey: { category: keyof IFilters | "", subCategory: string };
  category: IFilterValue;
  operator: IFilterValue;
  assignedValue: IFilterValue | IFilterValue[];
}

const defaultCurrentFilter: { category: keyof IFilters | "", subCategory: string } = { category: "", subCategory: "" };

export default function NavFilter() {
  const [selectedFilters, setSelectedFilters] = useState<ISelectedFilter[]>([]);
  const [currentFilter, setCurrentFilter] = useState<{ category: keyof IFilters | "", subCategory: string }>(defaultCurrentFilter);

  const handleRemoveFilterByIndex = (idx: number) => {
    setSelectedFilters((prev) => prev.filter((_, index) => index !== idx));
  };

  const updateSubCategoryValue = ( filterIndex: number, valueIndex: number, filterKey: { category: keyof IFilters; subCategory: string }) => {
    const selectedFilter = filtersData?.[filterKey?.category]?.[filterKey?.subCategory];
    const tempFilters = [...selectedFilters];

    if (!selectedFilter) return;

    const valueToToggle = selectedFilter.assignableValues[valueIndex];
    let assignedValues = tempFilters[filterIndex]?.assignedValue;

    if (selectedFilter?.canSelectMultiple) {
      assignedValues = Array.isArray(assignedValues) ? assignedValues : [ assignedValues ] as IFilterValue[]
      const valueExists = assignedValues.some((val) => val.value === valueToToggle.value);

      tempFilters[filterIndex].assignedValue = valueExists
        ? assignedValues.filter((val) => val.value !== valueToToggle.value)
        : [...assignedValues, valueToToggle];
    } else {
      tempFilters[filterIndex].assignedValue = valueToToggle
    }

    setSelectedFilters(tempFilters);
  };

  const handleFilterChange = (currentFilter: string) => {
    const [currentCategory, currentSubCategory] = currentFilter?.split("-") as [keyof typeof filtersData, string];
    const selectedFilter = filtersData[currentCategory][currentSubCategory];
    const hasAssignedValues = (selectedFilter.assignableValues && selectedFilter?.assignableValues?.length > 0);

    setSelectedFilters((prev) => [
      ...prev,
      {
        filterKey: { category: currentCategory, subCategory: currentSubCategory },
        category: { ...selectedFilter?.category, value: hasAssignedValues ? selectedFilter?.category?.value : currentCategory?.toUpperCase(), text: hasAssignedValues ? selectedFilter?.category?.text : currentCategory?.replace(/_/g, " ") },
        operator: selectedFilter.operators[0] || { text: "", value: "" },
        assignedValue: hasAssignedValues ? { text: "", value: "" } : selectedFilter?.category,
      },
    ]);

    setCurrentFilter(hasAssignedValues ? { category: currentCategory, subCategory: currentSubCategory } : defaultCurrentFilter);
  };

  const handleValueChange = (currentOption: string) => {
    const [currentCategory, currentSubCategory, optionIndex] = currentOption?.split("-") as [keyof typeof filtersData, string, number];
    const selectedFilter = filtersData[currentCategory][currentSubCategory];

    setSelectedFilters((prev) => {
      const updatedFilters = [...prev];
      const lastFilterIndex = updatedFilters.length - 1;
      updatedFilters[lastFilterIndex] = {
        ...updatedFilters[lastFilterIndex],
        assignedValue: selectedFilter?.assignableValues?.[optionIndex],
      };
      return updatedFilters;
    });
    setCurrentFilter(defaultCurrentFilter);
  };

  const handleOperatorChange = (currentOption: string) => {
    const [currentCategory, currentSubCategory, selectedFilterIndex, optionIndex] = currentOption?.split("-") as [keyof typeof filtersData, string, number, number];
    const selectedFilter = filtersData[currentCategory][currentSubCategory];

    setSelectedFilters((prev) => {
      const updatedFilters = [...prev];
      updatedFilters[selectedFilterIndex] = {
        ...updatedFilters[selectedFilterIndex],
        operator: selectedFilter?.operators?.[optionIndex],
      };
      return updatedFilters;
    });
  };

  const handleAssignableValueChange = (currentOption: string) => {
    const [currentCategory, currentSubCategory, selectedFilterIndex, optionIndex] = currentOption.split("-") as [ keyof typeof filtersData, string, number, number ];
  
    updateSubCategoryValue(selectedFilterIndex, optionIndex, { category: currentCategory, subCategory: currentSubCategory });
  
    const updatedFilter = selectedFilters[selectedFilterIndex];
    const isMultiple = Array.isArray(updatedFilter.assignedValue) && updatedFilter.assignedValue.length > 1;
    const operators = filtersData[currentCategory][currentSubCategory].operators;
  
    const isCurrentOperatorValid =
      updatedFilter.operator.forMultiple === undefined ||
      (isMultiple ? updatedFilter.operator.forMultiple === true : updatedFilter.operator.forMultiple === false);
  
    if (isCurrentOperatorValid) {
      return;
    }
  
    const validOperator =
      operators.find((operator) => {
        if (isMultiple) {
          return operator.forMultiple === true || operator.forMultiple === undefined;
        } else {
          return operator.forMultiple === false || operator.forMultiple === undefined;
        }
      }) || operators[0];
  
    setSelectedFilters((prev) => {
      const updatedFilters = [...prev];
      updatedFilters[selectedFilterIndex] = {
        ...updatedFilters[selectedFilterIndex],
        operator: validOperator,
      };
      return updatedFilters;
    });
  };

  const getFilteredOperators = (filter: ISelectedFilter) => {
    const operators = filtersData[filter.filterKey.category as keyof typeof filtersData][filter.filterKey.subCategory].operators;
    const isMultiple = Array.isArray(filter.assignedValue) && filter.assignedValue.length > 1;
  
    return operators
      .map((operator, originalIndex) => ({ ...operator, originalIndex }))
      .filter(operator => {
        if (operator.forMultiple === undefined) return true;
        return isMultiple ? operator.forMultiple === true : operator.forMultiple === false;
      });
  };

  return (
    <section>
      <ul className="px-4 py-1.5 flex flex-row items-center gap-2 flex-wrap border-b border-zinc-500/30">
        {selectedFilters?.filter(x => (Array.isArray(x?.assignedValue) ? x?.assignedValue?.length > 0 : !!x?.assignedValue?.value)).map((filter, index) => (
          <li key={`filter-${index}`} className="grid grid-flow-col h-max text-xs flex-row items-center gap-[2px] [&>*]:bg-neutral-800 [&>*]:px-2 [&>*]:py-1 text-white/90">
            <div className="rounded-l flex flex-row items-center gap-1">{filter?.category?.icon} {filter?.category.text}</div>
            <div className="text-white/70 relative">
              {filter.operator?.text}
              <Select onValueChange={handleOperatorChange}>
                <SelectTrigger className="absolute !h-full !w-full left-0 top-0 !p-0 opacity-0">
                  <SelectValue placeholder={`Select ${currentFilter}`} />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900/70 border-zinc-500/30 text-white/80">
                  <input type="text" className="borde border-neutral-500/50 w-full border-b border-b-neutral-500/30  bg-neutral-900/70 mb-1 text-neutral-500/50 px-2 pb-1.5 text-sm placeholder:capitalize" placeholder={currentFilter?.subCategory} />
                  {getFilteredOperators(filter).map((operator, subIndex) => (
                    <SelectItem key={`sub-filter-${operator.value}-${subIndex}`} value={`${filter?.filterKey?.category}-${filter?.filterKey?.subCategory}-${index}-${operator?.originalIndex}`} className="flex items-center gap-2">
                      <div className="flex items-center gap-2">{operator.icon} {operator.text}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="capitalize relative flex flex-row items-center gap-1">
              {
                (Array.isArray(filter?.assignedValue) && filter?.assignedValue?.length > 1)
                ? (
                  <div className="flex flex-row items-center gap-2">
                    <span className="flex flex-row items-center">{filter?.assignedValue?.map(x => x.icon)?.map((icon, iconIndex) => <span className="-mr-1" key={`filter-icon-${index}-${iconIndex}`}>{icon}</span>)}</span>
                    <span className="">{filter?.assignedValue?.length} {filter?.category?.text}</span>
                  </div>
                ) : (Array.isArray(filter?.assignedValue) && filter?.assignedValue?.length === 1) ? (
                  <>{filter?.assignedValue?.[0]?.icon} {filter?.assignedValue?.[0]?.text?.toLowerCase()?.replace(/_/g, " ")}</>
                ) : !(Array.isArray(filter?.assignedValue)) && (
                  <>{filter?.assignedValue?.icon} {filter?.assignedValue?.text?.toLowerCase()?.replace(/_/g, " ")}</>
                )
              }
              {
                (filtersData?.[filter?.filterKey?.category as keyof typeof filtersData]?.[filter?.filterKey?.subCategory].assignableValues && filtersData?.[filter?.filterKey?.category as keyof typeof filtersData]?.[filter?.filterKey?.subCategory].assignableValues?.length > 0)
                && (
                  <Select onValueChange={handleAssignableValueChange}>
                    <SelectTrigger className="absolute !h-full !w-full left-0 top-0 !p-0 opacity-0">
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900/70 border-zinc-500/30 text-white/80">
                      <input type="text" className="borde border-neutral-500/50 w-full border-b border-b-neutral-500/30  bg-neutral-900/70 mb-1 text-neutral-500/50 px-2 pb-1.5 text-sm placeholder:capitalize" placeholder={filter?.filterKey?.subCategory} />
                      {filtersData[filter?.filterKey?.category as keyof typeof filtersData][filter?.filterKey?.subCategory]?.assignableValues.map((operator, subIndex) => (
                        <SelectItem key={`sub-filter-${operator.value}-${subIndex}`} value={`${filter?.filterKey?.category}-${filter?.filterKey?.subCategory}-${index}-${subIndex}`} className={`flex items-center gap-2 cursor-pointer`}>
                          <div className="flex items-center gap-2">
                            {
                              filtersData[filter?.filterKey?.category as keyof typeof filtersData][filter?.filterKey?.subCategory]?.canSelectMultiple &&
                                <Checkbox onChange={(e) => { e.stopPropagation() }}
                                  checked={Array.isArray(filter?.assignedValue) ? filter?.assignedValue?.map(x => x.value)?.includes(operator?.value) : filter?.assignedValue?.value === operator?.value}
                                  className="border-neutral-500" />
                            }
                            {operator.icon} {operator.text}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              }
            </div>
            <button onClick={() => handleRemoveFilterByIndex(index)} className="rounded-r h-full !py-0 !px-1 !stroke-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
                <path fill="currentColor" d="m6.4 18.308l-.708-.708l5.6-5.6l-5.6-5.6l.708-.708l5.6 5.6l5.6-5.6l.708.708l-5.6 5.6l5.6 5.6l-.708.708l-5.6-5.6z"></path>
              </svg>
            </button>
          </li>
        ))}

        <li className="text-white/80 duration-200 hover:bg-neutral-800 rounded relative border-zinc-500/30 p-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M11 18q-.425 0-.712-.288T10 17t.288-.712T11 16h2q.425 0 .713.288T14 17t-.288.713T13 18zm-4-5q-.425 0-.712-.288T6 12t.288-.712T7 11h10q.425 0 .713.288T18 12t-.288.713T17 13zM4 8q-.425 0-.712-.288T3 7t.288-.712T4 6h16q.425 0 .713.288T21 7t-.288.713T20 8z"></path>
          </svg>
          {!currentFilter?.category && !currentFilter?.subCategory ? (
            <Select onValueChange={handleFilterChange}>
              <SelectTrigger className="!absolute !h-full !w-full !left-0 !top-0 !p-0 opacity-0">
              </SelectTrigger>
              <SelectContent className=" bg-neutral-900/70 border-zinc-500/30 text-white/80">
                <input type="text" className="borde border-neutral-500/50 rounded w-full bg-neutral-900/70 mb-1 placeholder:text-neutral-500 px-2 py-1 text-xs" placeholder="Filter..." />
                {Object.entries(filtersData).map(([key, value], index) => (
                  <div key={`filter-category-${key}-${index}`} className="border-t border-t-neutral-500/50 ">
                    {
                      Object.entries(value as IFilterItem).map(([subkey, subValue], subIndex) => (
                        <SelectItem key={`filter-value-${key}-${subkey}-${subIndex}`} value={`${key}-${subkey}`}>
                          <div className="flex items-center gap-2 capitalize">{subValue?.category?.icon} {subkey?.replace(/_/g, " ")}</div>
                        </SelectItem>
                      ))
                    }
                  </div>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Select open={!!currentFilter?.category} onValueChange={handleValueChange}>
              <SelectTrigger className="absolute !h-full !w-full left-0 top-0 !p-0 opacity-0">
                <SelectValue placeholder={`Select ${currentFilter}`} />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900/70 border-zinc-500/30 text-white/80">
                <input type="text" className="borde border-neutral-500/50 w-full border-b border-b-neutral-500/30  bg-neutral-900/70 mb-1 placeholder:text-neutral-500 px-2 pb-1.5 text-sm placeholder:capitalize" placeholder={currentFilter?.subCategory} />
                {filtersData[currentFilter?.category as keyof typeof filtersData][currentFilter?.subCategory]?.assignableValues.map((option, subIndex) => (
                  <SelectItem key={`sub-filter-${option.value}-${subIndex}`} value={`${currentFilter?.category}-${currentFilter?.subCategory}-${subIndex}`} className="flex items-center gap-2">
                    <div className="flex items-center gap-2">{filtersData[currentFilter?.category as keyof typeof filtersData][currentFilter?.subCategory]?.canSelectMultiple && <Checkbox className="border-neutral-500" />} {option.icon} {option.text}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </li>
      </ul>
    </section>
  );
}

const filtersData: IFilters = {
  ai: {
    ai_filter: {
      category: { text: "AI Filter", value: "AI_FILTER", icon: <RiRobot2Line /> },
      operators: [],
      assignableValues: [],
    },
  },
  status: {
    status: {
      category: { text: "Status", value: "STATUS", icon: <TbAdjustmentsHorizontal /> },
      operators: [
        { text: "is", value: "IS", forMultiple: false },
        { text: "is any of", value: "IS_ANY_OF", forMultiple: true },
        { text: "is not", value: "IS_NOT" },
      ],
      assignableValues: [
        { text: "Todo", value: "TODO", icon: <TbCheckbox /> },
        { text: "In Progress", value: "IN_PROGRESS", icon: <TbAdjustmentsHorizontal /> },
        { text: "Completed", value: "COMPLETED", icon: <TbCheckbox /> },
        { text: "Aborted", value: "ABORTED", icon: <TbCheckbox /> },
      ],
      canSelectMultiple: true,
    },
    assignee: {
      category: { text: "Assignee", value: "ASSIGNEE", icon: <FaRegUser /> },
      operators: [
        { text: "is", value: "IS", forMultiple: false },
        { text: "is any of", value: "IS_ANY_OF", forMultiple: true },
        { text: "is not", value: "IS_NOT" },
      ],
      assignableValues: [
        { text: "No assignee", value: "NO_ASSIGNEE", icon: <FaRegUser /> },
        { text: "Current user", value: "CURRENT_USER", icon: <FaRegUser /> },
      ],
      canSelectMultiple: true,
    },
    creator: {
      category: { text: "Creator", value: "CREATOR", icon: <FaRegUser /> },
      operators: [
        { text: "is", value: "IS", forMultiple: false },
        { text: "is any of", value: "IS_ANY_OF", forMultiple: true },
        { text: "is not", value: "IS_NOT" },
      ],
      assignableValues: [
        { text: "No Creator", value: "NO_CREATOR", icon: <FaRegUser /> },
        { text: "Current user", value: "CURRENT_USER", icon: <FaRegUser /> },
      ],
      canSelectMultiple: true,
    },
    priority: {
      category: { text: "Priority", value: "PRIORITY", icon: <TbFlag /> },
      operators: [
        { text: "is", value: "IS", forMultiple: false },
        { text: "is any of", value: "IS_ANY_OF", forMultiple: true },
        { text: "is not", value: "IS_NOT" },
      ],
      assignableValues: [
        { text: "No priority", value: "NO_PRIORITY", icon: <TbFlag /> },
        { text: "Urgent", value: "URGENT", icon: <TbFlag /> },
        { text: "High", value: "HIGH", icon: <TbFlag /> },
        { text: "Low", value: "LOW", icon: <TbFlag /> },
      ],
      canSelectMultiple: true,
    },
    labels: {
      category: { text: "Labels", value: "LABELS", icon: <TbTags /> },
      operators: [
        { text: "include", value: "INCLUDE" },
        { text: "do not include", value: "DO_NOT_INCLUDE" },
      ],
      assignableValues: [
        { text: "Feature", value: "FEATURE", icon: <TbTags /> },
        { text: "Bug", value: "BUG", icon: <TbTags /> },
        { text: "Improvement", value: "IMPROVEMENT", icon: <TbTags /> },
      ],
      canSelectMultiple: true,
    },
    content: {
      category: { text: "Content", value: "CONTENT", icon: <HiOutlineClipboardList /> },
      operators: [
        { text: "contains", value: "CONTAINS" },
        { text: "do not contain", value: "DOES_NOT_CONTAIN" },
      ],
      assignableValues: [],
      canSelectMultiple: true,
    },
    project: {
      category: { text: "Project", value: "PROJECT", icon: <TbFilter /> },
      operators: [
        { text: "is", value: "IS", forMultiple: false },
        { text: "is any of", value: "IS_ANY_OF", forMultiple: true },
        { text: "is not", value: "IS_NOT" },
      ],
      assignableValues: [
        { text: "No project", value: "NO_PROJECT", icon: <TbFilter /> },
      ],
      canSelectMultiple: true,
    },
    project_status: {
      category: { text: "Project status", value: "PROJECT_STATUS", icon: <TbAdjustmentsHorizontal /> },
      operators: [
        { text: "is", value: "IS", forMultiple: false },
        { text: "is any of", value: "IS_ANY_OF", forMultiple: true },
        { text: "is not", value: "IS_NOT" },
      ],
      assignableValues: [],
      canSelectMultiple: true,
    },
    project_priority: {
      category: { text: "Project priority", value: "PROJECT_PRIORITY", icon: <TbFlag /> },
      operators: [
        { text: "is", value: "IS", forMultiple: false },
        { text: "is any of", value: "IS_ANY_OF", forMultiple: true },
        { text: "is not", value: "IS_NOT" },
      ],
      assignableValues: [
        { text: "High", value: "HIGH", icon: <TbFlag /> },
        { text: "Medium", value: "MEDIUM", icon: <TbFlag /> },
        { text: "Low", value: "LOW", icon: <TbFlag /> },
      ],
      canSelectMultiple: true,
    },
  },
  issue: {
    parent_issues: {
      category: { text: "Parent issue", value: "PARENT_ISSUES", icon: <BsThreeDots /> },
      operators: [
        { text: "is", value: "IS" },
        { text: "is not", value: "IS_NOT" },
      ],
      assignableValues: [],
    },
    sub_issues: {
      category: { text: "Sub-issues", value: "SUB_ISSUES", icon: <BsThreeDots /> },
      operators: [
        { text: "is", value: "IS" },
        { text: "is not", value: "IS_NOT" },
      ],
      assignableValues: [],
    },
    blocked: {
      category: { text: "Blocked", value: "BLOCKED_ISSUES", icon: <MdCheckBoxOutlineBlank /> },
      operators: [
        { text: "is", value: "IS" },
        { text: "is not", value: "IS_NOT" },
      ],
      assignableValues: [],
    },
    blocking_issues: {
      category: { text: "Blocking", value: "BLOCKING_ISSUES", icon: <MdCheckBoxOutlineBlank /> },
      operators: [
        { text: "is", value: "IS" },
        { text: "is not", value: "IS_NOT" },
      ],
      assignableValues: [],
    },
    recurring_issues: {
      category: { text: "Not recurring", value: "RECURRING_ISSUES", icon: <MdCheckBoxOutlineBlank /> },
      operators: [
        { text: "is", value: "IS" },
        { text: "is not", value: "IS_NOT" },
      ],
      assignableValues: [
        { text: "Not recurring", value: "NOT_RECURRING", icon: <MdCheckBoxOutlineBlank /> },
      ],
      canSelectMultiple: true,
    },
    issues_with_references: {
      category: { text: "Issues with references", value: "ISSUES_WITH_REFERENCES", icon: <TbCheckbox /> },
      operators: [
        { text: "is", value: "IS" },
        { text: "is not", value: "IS_NOT" },
      ],
      assignableValues: [],
    },
    duplicates: {
      category: { text: "Issue with duplicate", value: "ISSUE_WITH_DUPLICATE", icon: <TbCheckbox /> },
      operators: [
        { text: "is", value: "IS" },
        { text: "is not", value: "IS_NOT" },
      ],
      assignableValues: [],
    },
  },
  dates: {
    due_date: {
      category: { text: "Due date", value: "DUE_DATE", icon: <MdOutlineDateRange /> },
      operators: [
        { text: "after", value: "AFTER" },
        { text: "before", value: "BEFORE" },
      ],
      assignableValues: [
        { text: "1 day ago", value: "1_DAY_AGO", icon: <MdOutlineDateRange /> },
        { text: "3 days ago", value: "3_DAYS_AGO", icon: <MdOutlineDateRange /> },
        { text: "1 week ago", value: "1_WEEK_AGO", icon: <MdOutlineDateRange /> },
        { text: "1 month ago", value: "1_MONTH_AGO", icon: <MdOutlineDateRange /> },
        { text: "3 months ago", value: "3_MONTHS_AGO", icon: <MdOutlineDateRange /> },
        { text: "6 months ago", value: "6_MONTHS_AGO", icon: <MdOutlineDateRange /> },
        { text: "1 year ago", value: "1_YEAR_AGO", icon: <MdOutlineDateRange /> },
        { text: "Custom date or timeframe", value: "CUSTOM_DATE", icon: <MdOutlineDateRange /> },
      ],
    },
    created_date: {
      category: { text: "Created date", value: "CREATED_DATE", icon: <MdOutlineDateRange /> },
      operators: [
        { text: "after", value: "AFTER" },
        { text: "before", value: "BEFORE" },
      ],
      assignableValues: [
        { text: "1 day ago", value: "1_DAY_AGO", icon: <MdOutlineDateRange /> },
        { text: "3 days ago", value: "3_DAYS_AGO", icon: <MdOutlineDateRange /> },
        { text: "1 week ago", value: "1_WEEK_AGO", icon: <MdOutlineDateRange /> },
        { text: "1 month ago", value: "1_MONTH_AGO", icon: <MdOutlineDateRange /> },
        { text: "3 months ago", value: "3_MONTHS_AGO", icon: <MdOutlineDateRange /> },
        { text: "6 months ago", value: "6_MONTHS_AGO", icon: <MdOutlineDateRange /> },
        { text: "1 year ago", value: "1_YEAR_AGO", icon: <MdOutlineDateRange /> },
        { text: "Custom date or timeframe", value: "CUSTOM_DATE", icon: <MdOutlineDateRange /> },
      ],
    },
    updated_date: {
      category: { text: "Updated date", value: "UPDATED_DATE", icon: <MdOutlineUpdate /> },
      operators: [
        { text: "after", value: "AFTER" },
        { text: "before", value: "BEFORE" },
      ],
      assignableValues: [
        { text: "1 day ago", value: "1_DAY_AGO", icon: <MdOutlineUpdate /> },
        { text: "3 days ago", value: "3_DAYS_AGO", icon: <MdOutlineUpdate /> },
        { text: "1 week ago", value: "1_WEEK_AGO", icon: <MdOutlineUpdate /> },
        { text: "1 month ago", value: "1_MONTH_AGO", icon: <MdOutlineUpdate /> },
        { text: "3 months ago", value: "3_MONTHS_AGO", icon: <MdOutlineUpdate /> },
        { text: "6 months ago", value: "6_MONTHS_AGO", icon: <MdOutlineUpdate /> },
        { text: "1 year ago", value: "1_YEAR_AGO", icon: <MdOutlineUpdate /> },
        { text: "Custom date or timeframe", value: "CUSTOM_DATE", icon: <MdOutlineUpdate /> },
      ],
    },
    started_date: {
      category: { text: "Started date", value: "STARTED_DATE", icon: <TbCalendarTime /> },
      operators: [
        { text: "after", value: "AFTER" },
        { text: "before", value: "BEFORE" },
      ],
      assignableValues: [
        { text: "1 day ago", value: "1_DAY_AGO", icon: <TbCalendarTime /> },
        { text: "3 days ago", value: "3_DAYS_AGO", icon: <TbCalendarTime /> },
        { text: "1 week ago", value: "1_WEEK_AGO", icon: <TbCalendarTime /> },
        { text: "1 month ago", value: "1_MONTH_AGO", icon: <TbCalendarTime /> },
        { text: "3 months ago", value: "3_MONTHS_AGO", icon: <TbCalendarTime /> },
        { text: "6 months ago", value: "6_MONTHS_AGO", icon: <TbCalendarTime /> },
        { text: "1 year ago", value: "1_YEAR_AGO", icon: <TbCalendarTime /> },
        { text: "Custom date or timeframe", value: "CUSTOM_DATE", icon: <TbCalendarTime /> },
      ],
    },
    completed_date: {
      category: { text: "Completed date", value: "COMPLETED_DATE", icon: <TbCalendarTime /> },
      operators: [
        { text: "after", value: "AFTER" },
        { text: "before", value: "BEFORE" },
      ],
      assignableValues: [
        { text: "1 day ago", value: "1_DAY_AGO", icon: <TbCalendarTime /> },
        { text: "3 days ago", value: "3_DAYS_AGO", icon: <TbCalendarTime /> },
        { text: "1 week ago", value: "1_WEEK_AGO", icon: <TbCalendarTime /> },
        { text: "1 month ago", value: "1_MONTH_AGO", icon: <TbCalendarTime /> },
        { text: "3 months ago", value: "3_MONTHS_AGO", icon: <TbCalendarTime /> },
        { text: "6 months ago", value: "6_MONTHS_AGO", icon: <TbCalendarTime /> },
        { text: "1 year ago", value: "1_YEAR_AGO", icon: <TbCalendarTime /> },
        { text: "Custom date or timeframe", value: "CUSTOM_DATE", icon: <TbCalendarTime /> },
      ],
    },
    triaged_date: {
      category: { text: "Triaged date", value: "TRIAGED_DATE", icon: <TbCalendarTime /> },
      operators: [
        { text: "after", value: "AFTER" },
        { text: "before", value: "BEFORE" },
      ],
      assignableValues: [
        { text: "1 day ago", value: "1_DAY_AGO", icon: <TbCalendarTime /> },
        { text: "3 days ago", value: "3_DAYS_AGO", icon: <TbCalendarTime /> },
        { text: "1 week ago", value: "1_WEEK_AGO", icon: <TbCalendarTime /> },
        { text: "1 month ago", value: "1_MONTH_AGO", icon: <TbCalendarTime /> },
        { text: "3 months ago", value: "3_MONTHS_AGO", icon: <TbCalendarTime /> },
        { text: "6 months ago", value: "6_MONTHS_AGO", icon: <TbCalendarTime /> },
        { text: "1 year ago", value: "1_YEAR_AGO", icon: <TbCalendarTime /> },
        { text: "Custom date or timeframe", value: "CUSTOM_DATE", icon: <TbCalendarTime /> },
      ],
    },
  },
  misc: {
    auto_closed: {
      category: { text: "Auto-closed", value: "AUTO_CLOSED", icon: <TbCheckbox /> },
      operators: [
        { text: "is", value: "IS" },
        { text: "is not", value: "IS_NOT" },
      ],
      assignableValues: [],
    },
    subscriber: {
      category: { text: "Subscriber", value: "SUBSCRIBER", icon: <FiBell /> },
      operators: [
        { text: "is", value: "IS" },
        { text: "is not", value: "IS_NOT" },
      ],
      assignableValues: [],
    },
    links: {
      category: { text: "Links", value: "LINKS", icon: <FiLink /> },
      operators: [],
      assignableValues: [],
    },
    template: {
      category: { text: "Template", value: "TEMPLATE", icon: <HiOutlineClipboardList /> },
      operators: [
        { text: "is", value: "IS" },
        { text: "is not", value: "IS_NOT" },
      ],
      assignableValues: [
        { text: "No template", value: "NO_TEMPLATE", icon: <HiOutlineClipboardList /> },
      ],
    },
  },
};