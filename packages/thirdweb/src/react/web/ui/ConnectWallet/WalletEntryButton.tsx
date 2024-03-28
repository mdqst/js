import { Container } from "../components/basic.js";
import { useCustomTheme } from "../design-system/CustomThemeProvider.js";
import { StyledButton } from "../design-system/elements.js";
import { iconSize, spacing, radius, fontSize } from "../design-system/index.js";
import { Text } from "../components/text.js";
import { useScreenContext } from "./Modal/screen.js";
// import { localWalletMetadata } from "../../../../wallets/local/index._ts";
import { useWalletConnectionCtx } from "../../../core/hooks/others/useWalletConnectionCtx.js";
import { useWalletInfo } from "../hooks/useWalletInfo.js";
import { Skeleton } from "../components/Skeleton.js";
import { WalletImage } from "../components/WalletImage.js";
import { getMIPDStore } from "../../../../wallets/injected/mipdStore.js";
import type { WalletId } from "../../../../wallets/wallet-types.js";

/**
 * @internal
 */
export function WalletEntryButton(props: {
  walletId: WalletId;
  selectWallet: () => void;
}) {
  const { walletId, selectWallet } = props;
  const { connectLocale, recommendedWallets } = useWalletConnectionCtx();
  const isRecommended = recommendedWallets?.find((w) => w.id === walletId);
  const { screen } = useScreenContext();
  const walletInfo = useWalletInfo(walletId);

  const walletName =
    getMIPDStore()
      .getProviders()
      .find((p) => p.info.rdns === walletId)?.info.name ||
    walletInfo.data?.name;

  const isInstalled = getMIPDStore()
    .getProviders()
    .find((p) => p.info.rdns === walletId);

  return (
    <WalletButton
      type="button"
      onClick={selectWallet}
      data-active={
        screen && typeof screen === "object" && screen.id === walletId
      }
    >
      <WalletImage id={walletId} size={iconSize.xl} />

      <Container flex="column" gap="xxs" expand>
        {walletName ? (
          <Text color="primaryText" weight={600}>
            {walletName}
          </Text>
        ) : (
          <Skeleton width="100px" height={fontSize.md} />
        )}

        {isRecommended && <Text size="sm">{connectLocale.recommended}</Text>}

        {!isRecommended && isInstalled && (
          <Text size="sm">{connectLocale.installed}</Text>
        )}
      </Container>
    </WalletButton>
  );
}

export const WalletButton = /* @__PURE__ */ StyledButton(() => {
  const theme = useCustomTheme();
  return {
    all: "unset",
    display: "flex",
    alignItems: "center",
    gap: spacing.sm,
    cursor: "pointer",
    boxSizing: "border-box",
    width: "100%",
    color: theme.colors.secondaryText,
    position: "relative",
    borderRadius: radius.md,
    padding: `${spacing.xs} ${spacing.xs}`,
    "&:hover": {
      backgroundColor: theme.colors.walletSelectorButtonHoverBg,
      transform: "scale(1.01)",
    },
    '&[data-active="true"]': {
      backgroundColor: theme.colors.walletSelectorButtonHoverBg,
    },
    transition: "background-color 200ms ease, transform 200ms ease",
  };
});