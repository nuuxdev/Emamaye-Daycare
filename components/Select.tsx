import { useEffect, useRef, useState, Fragment } from "react";
import { FieldValues, Path, PathValue, UseFormRegister, UseFormSetValue } from "react-hook-form";

type Option = {
    value: string;
    label: string;
};

type SelectProps<T extends FieldValues> = {
    options: Option[];
    label: string;
    id: Path<T>;
    register: UseFormRegister<T>;
    setValue: UseFormSetValue<T>;
    placeholder?: string;
    defaultValue?: string;
    value?: string;
};

export default function Select<T extends FieldValues>({
    options,
    label,
    id,
    register,
    setValue,
    placeholder = "Select an option",
    defaultValue,
    value,
}: SelectProps<T>) {
    const [selected, setSelected] = useState<string>("");
    const [displayValue, setDisplayValue] = useState<string>("");
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Sync with external value or default value
    useEffect(() => {
        const valToUse = value || defaultValue;
        if (valToUse) {
            const option = options.find((opt) => opt.value === valToUse);
            if (option) {
                setSelected(valToUse);
                setDisplayValue(option.label);
                // Only set value if it's defaultValue (initialization), 
                // if it's 'value' prop it means it's already set in form
                if (!value && defaultValue) {
                    setValue(id, defaultValue as PathValue<T, Path<T>>);
                }
            }
        }
    }, [value, defaultValue, options, setValue, id]);

    const handleSelect = (value: string) => {
        const option = options.find((opt) => opt.value === value);
        if (option) {
            setSelected(value);
            setValue(id, value as PathValue<T, Path<T>>, { shouldValidate: true, shouldDirty: true });
            setDisplayValue(option.label);
            dialogRef.current?.close();
        }
    };

    return (
        <div className="mb-1">
            <label htmlFor={id} className="label-text">
                {label}
            </label>
            <div className="relative">
                <input
                    className="neo-input"
                    style={{ cursor: "pointer" }}
                    onClick={() => dialogRef.current?.showModal()}
                    value={displayValue}
                    readOnly
                    placeholder={placeholder}
                />
                <input type="hidden" {...register(id, { required: true })} />
                <div style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.5 }}>
                    ▼
                </div>
            </div>

            <dialog ref={dialogRef}>
                <h3 className="dialog-title">{label}</h3>

                <div className="select-list">
                    {options.map((option, index) => (
                        <Fragment key={option.value}>
                            <label className="select-option" onClick={() => handleSelect(option.value)}>
                                <input
                                    type="radio"
                                    name={`${id}-option`}
                                    value={option.value}
                                    checked={selected === option.value}
                                    readOnly
                                />
                                <span>{option.label}</span>
                            </label>
                            {index < options.length - 1 && <hr />}
                        </Fragment>
                    ))}
                </div>
            </dialog>
        </div>
    );
}
