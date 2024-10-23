import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ToolTipLabel } from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleAlertIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { isAddress } from "thirdweb";
import { z } from "zod";
import { ModuleCardUI, type ModuleCardUIProps } from "./module-card";

const formSchema = z.object({
  allowList: z.array(
    z.object({
      address: z.string().refine(
        (v) => {
          // don't return `isAddress(v)` directly to avoid typecasting address as `0x${string}`
          if (isAddress(v)) {
            return true;
          }
          return false;
        },
        {
          message: "Invalid Address",
        },
      ),
    }),
  ),
  isRestricted: z.boolean(),
});

export type TransferrableModuleFormValues = z.infer<typeof formSchema>;

export function TransferrableModuleUI(
  props: Omit<ModuleCardUIProps, "children" | "updateButton"> & {
    allowList: string[];
    isRestricted: boolean;
    isPending: boolean;
    adminAddress: string;
    update: (values: TransferrableModuleFormValues) => Promise<void>;
  },
) {
  const form = useForm<TransferrableModuleFormValues>({
    resolver: zodResolver(formSchema),
    values: {
      allowList: props.allowList.map((x) => ({ address: x })),
      isRestricted: props.isRestricted,
    },
    reValidateMode: "onChange",
  });

  const updateMutation = useMutation({
    mutationFn: props.update,
  });

  const formFields = useFieldArray({
    control: form.control,
    name: "allowList",
  });

  const onSubmit = () => {
    const _values = form.getValues();
    const values = { ..._values };

    // clear the allowlist if no restrictions
    if (!_values.isRestricted) {
      values.allowList = [];
    }

    const promise = updateMutation.mutateAsync(values);
    toast.promise(promise, {
      success: "Successfully updated transfer restrictions",
      error: "Failed to update transfer restrictions",
    });
  };

  const isRestricted = form.watch("isRestricted");

  if (!props.contractInfo) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <ModuleCardUI
      {...props}
      updateButton={{
        onClick: onSubmit,
        isPending: updateMutation.isPending,
        isDisabled: !form.formState.isDirty,
      }}
    >
      {props.isPending ? (
        <Skeleton className="h-36" />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(() => {})}>
            <div className="flex items-center gap-4">
              {/* Switch */}
              <FormField
                control={form.control}
                name="isRestricted"
                render={({ field }) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { value, ...restField } = field;

                  return (
                    <FormItem className="flex items-center gap-3">
                      <FormLabel>Restrict Transfers</FormLabel>
                      <FormControl>
                        <Switch
                          {...restField}
                          checked={field.value}
                          disabled={!props.isOwnerAccount}
                          className="!m-0"
                          onCheckedChange={(v) => {
                            field.onChange(v);

                            // if enabling restrictions and allowlist is empty, add the admin address by default
                            if (v === true && formFields.fields.length === 0) {
                              formFields.append({
                                address: props.adminAddress || "",
                              });
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
            </div>

            <div className="h-3" />

            {isRestricted && (
              <div className="w-full">
                {/* Warning  */}
                {formFields.fields.length === 0 ? (
                  <Alert variant="warning">
                    <CircleAlertIcon className="size-5" />
                    <AlertTitle>
                      Nobody has permission to transfer tokens on this contract
                    </AlertTitle>
                  </Alert>
                ) : (
                  <div className="flex flex-col gap-3">
                    {/* Addresses */}
                    {formFields.fields.map((fieldItem, index) => (
                      <div
                        className="flex items-start gap-3"
                        key={fieldItem.id}
                      >
                        <FormField
                          control={form.control}
                          name={`allowList.${index}.address`}
                          render={({ field }) => (
                            <FormItem className="grow">
                              <FormControl>
                                <Input
                                  placeholder="0x..."
                                  {...field}
                                  disabled={!props.isOwnerAccount}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <ToolTipLabel label="Remove address">
                          <Button
                            variant="outline"
                            className="!text-destructive-text bg-background"
                            onClick={() => {
                              formFields.remove(index);
                            }}
                            disabled={!props.isOwnerAccount}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </ToolTipLabel>
                      </div>
                    ))}
                  </div>
                )}

                <div className="h-3" />

                {/* Add Addresses Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // add admin by default if adding the first input
                      formFields.append({
                        address:
                          formFields.fields.length === 0
                            ? props.adminAddress
                            : "",
                      });
                    }}
                    className="gap-2"
                    disabled={!props.isOwnerAccount}
                  >
                    <PlusIcon className="size-3" />
                    Add Address
                  </Button>
                </div>
              </div>
            )}

            {!isRestricted && (
              <Alert variant="info">
                <CircleAlertIcon className="size-5" />
                <AlertTitle>
                  Transferring tokens in this contract is not restricted.
                  Everyone is free to transfer their tokens.
                </AlertTitle>
              </Alert>
            )}
          </form>
        </Form>
      )}
    </ModuleCardUI>
  );
}