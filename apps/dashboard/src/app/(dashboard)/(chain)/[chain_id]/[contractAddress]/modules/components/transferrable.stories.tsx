import { Checkbox } from "@/components/ui/checkbox";
import type { Meta, StoryObj } from "@storybook/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { BadgeContainer, mobileViewport } from "stories/utils";
import { ThirdwebProvider } from "thirdweb/react";
import {
  type TransferrableModuleFormValues,
  TransferrableModuleUI,
} from "./Transferrable";

const meta = {
  title: "Modules/Transferrable",
  component: Component,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  args: {},
};

export const Mobile: Story = {
  args: {},
  parameters: {
    viewport: mobileViewport("iphone14"),
  },
};

const testAddress1 = "0x1F846F6DAE38E1C88D71EAA191760B15f38B7A37";
const testAddress2 = "0x83Dd93fA5D8343094f850f90B3fb90088C1bB425";

export function CheckboxWithText() {
  return (
    <div className="items-top flex space-x-2">
      <Checkbox id="terms1" />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor="terms1"
          className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Is Owner
        </label>
      </div>
    </div>
  );
}

function Component() {
  const [isOwner, setIsOwner] = useState(true);
  async function updateStub(values: TransferrableModuleFormValues) {
    console.log("submitting", values);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const removeMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess() {
      toast.success("Module removed successfully");
    },
  });

  const contractInfo = {
    name: "TransferrableModule",
    description:
      "Control transferability of ERC721 tokens, such as enabling or disabling transfers.",
    publisher: "0xdd99b75f095d0c4d5112aCe938e4e6ed962fb024",
    version: "1.0.0",
  };

  return (
    <ThirdwebProvider>
      <div className="container flex max-w-[1150px] flex-col gap-10 py-10">
        <div className="items-top flex space-x-2">
          <Checkbox
            id="terms1"
            checked={isOwner}
            onCheckedChange={(v) => setIsOwner(!!v)}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms1"
              className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Is Owner
            </label>
          </div>
        </div>

        <BadgeContainer label="Empty AllowList, Not Restricted">
          <TransferrableModuleUI
            contractInfo={contractInfo}
            moduleAddress="0x0000000000000000000000000000000000000000"
            allowList={[]}
            isPending={false}
            isRestricted={false}
            adminAddress={testAddress1}
            update={updateStub}
            uninstallButton={{
              onClick: () => removeMutation.mutateAsync(),
              isPending: removeMutation.isPending,
            }}
            isOwnerAccount={isOwner}
          />
        </BadgeContainer>

        <BadgeContainer label="Empty AllowList, Restricted">
          <TransferrableModuleUI
            contractInfo={contractInfo}
            moduleAddress="0x0000000000000000000000000000000000000000"
            allowList={[]}
            isPending={false}
            isRestricted={true}
            adminAddress={testAddress1}
            update={updateStub}
            uninstallButton={{
              onClick: () => removeMutation.mutateAsync(),
              isPending: removeMutation.isPending,
            }}
            isOwnerAccount={isOwner}
          />
        </BadgeContainer>

        <BadgeContainer label="Length 1 AllowList, Restricted">
          <TransferrableModuleUI
            contractInfo={contractInfo}
            moduleAddress="0x0000000000000000000000000000000000000000"
            allowList={[testAddress1]}
            isPending={false}
            isRestricted={true}
            adminAddress={testAddress1}
            update={updateStub}
            uninstallButton={{
              onClick: () => removeMutation.mutateAsync(),
              isPending: removeMutation.isPending,
            }}
            isOwnerAccount={isOwner}
          />
        </BadgeContainer>

        <BadgeContainer label="Length 2 AllowList, Restricted">
          <TransferrableModuleUI
            contractInfo={contractInfo}
            moduleAddress="0x0000000000000000000000000000000000000000"
            allowList={[testAddress1, testAddress2]}
            isPending={false}
            isRestricted={true}
            adminAddress={testAddress1}
            update={updateStub}
            uninstallButton={{
              onClick: () => removeMutation.mutateAsync(),
              isPending: removeMutation.isPending,
            }}
            isOwnerAccount={isOwner}
          />
        </BadgeContainer>

        <BadgeContainer label="Pending">
          <TransferrableModuleUI
            contractInfo={contractInfo}
            moduleAddress="0x0000000000000000000000000000000000000000"
            allowList={[]}
            isPending={true}
            adminAddress={testAddress1}
            isRestricted={false}
            update={updateStub}
            uninstallButton={{
              onClick: () => removeMutation.mutateAsync(),
              isPending: removeMutation.isPending,
            }}
            isOwnerAccount={isOwner}
          />
        </BadgeContainer>

        <Toaster richColors />
      </div>
    </ThirdwebProvider>
  );
}