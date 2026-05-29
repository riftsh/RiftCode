// RiftClaw upgrade view — shown when instance needs upgrade for chat

import { Button } from "@riftcode/kilo-ui/button"
import { Card, CardTitle, CardDescription, CardActions } from "@riftcode/kilo-ui/card"
import { useClaw } from "../context/claw"
import { useRiftClawLanguage } from "../context/language"

export function UpgradeView() {
  const claw = useClaw()
  const { t } = useRiftClawLanguage()

  return (
    <div class="riftclaw-center">
      <Card class="riftclaw-card">
        <CardTitle icon={false}>{t("kiloClaw.upgrade.title")}</CardTitle>
        <CardDescription>
          <p class="riftclaw-card-text">{t("kiloClaw.upgrade.description1")}</p>
          <p class="riftclaw-card-text">
            {t("kiloClaw.upgrade.description2.before")}
            <strong>{t("kiloClaw.upgrade.description2.bold")}</strong>
            {t("kiloClaw.upgrade.description2.after")}
          </p>
        </CardDescription>
        <CardActions>
          <div />
          <Button variant="primary" onClick={() => claw.openExternal("https://app.kilo.ai/claw")}>
            {t("kiloClaw.upgrade.openDashboard")}
          </Button>
        </CardActions>
      </Card>
    </div>
  )
}
