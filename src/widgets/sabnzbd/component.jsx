import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import QueueEntry from "../../components/widgets/queue/queueEntry";

import useWidgetAPI from "utils/proxy/use-widget-api";

const defaultLimit = 5;

function fromUnits(value) {
  const units = ["B", "K", "M", "G", "T", "P"];
  const [number, unit] = value.split(" ");
  const index = units.indexOf(unit);
  if (index === -1) {
    return 0;
  }
  return parseFloat(number) * 1024 ** index;
}

function getProgress(mbleft, mb) {
  const remaining = Number(mbleft);
  const total = Number(mb);
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.min(100, Math.max(0, (1 - remaining / total) * 100));
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const enableQueue = !!widget?.enableQueue;
  const parsedLimit = Number(widget?.limit);
  const limit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : defaultLimit;
  const { data: queueData, error: queueError } = useWidgetAPI(widget, "queue", { limit });

  if (queueError) {
    return <Container service={service} error={queueError} />;
  }

  if (!queueData) {
    return (
      <Container service={service}>
        <Block label="sabnzbd.rate" />
        <Block label="sabnzbd.queue" />
        <Block label="sabnzbd.timeleft" />
      </Container>
    );
  }

  return (
    <>
      <Container service={service}>
        <Block label="sabnzbd.rate" value={t("common.byterate", { value: fromUnits(queueData.queue.speed) })} />
        <Block label="sabnzbd.queue" value={t("common.number", { value: queueData.queue.noofslots })} />
        <Block label="sabnzbd.timeleft" value={queueData.queue.timeleft} />
      </Container>
      {enableQueue &&
        queueData.queue?.slots
          ?.slice(0, limit)
          .map((slot) => (
            <QueueEntry
              progress={getProgress(slot.mbleft, slot.mb)}
              timeLeft={slot.timeleft}
              title={slot.filename}
              activity={slot.percentage === "0" ? "Queued" : slot.status}
              key={slot.nzo_id ?? slot.filename}
            />
          ))}
    </>
  );
}
