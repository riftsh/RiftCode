// RiftClaw setup view — shown when no instance is provisioned

import { Button } from "@riftcode/kilo-ui/button"
import { Card, CardTitle, CardDescription, CardActions } from "@riftcode/kilo-ui/card"
import { useClaw } from "../context/claw"
import { useRiftClawLanguage } from "../context/language"

export function SetupView() {
  const claw = useClaw()
  const { t } = useRiftClawLanguage()

  return (
    <div class="riftclaw-center">
      <Card class="riftclaw-card">
        <CardTitle icon={false}>{t("kiloClaw.setup.title")}</CardTitle>
        <CardDescription>
          <h3 class="riftclaw-card-subtitle">{t("kiloClaw.setup.subtitle")}</h3>
          <p class="riftclaw-card-text">{t("kiloClaw.setup.description1")}</p>
          <p class="riftclaw-card-text">{t("kiloClaw.setup.description2")}</p>
        </CardDescription>
        <CardActions>
          <Button variant="ghost" onClick={() => claw.openExternal("https://kilo.ai/riftclaw")}>
            {t("kiloClaw.setup.learnMore")}
          </Button>
          <Button variant="primary" onClick={() => claw.openExternal("https://app.kilo.ai/claw")}>
            {t("kiloClaw.setup.tryRiftClaw")}
          </Button>
        </CardActions>
      </Card>
    </div>
  )
}
