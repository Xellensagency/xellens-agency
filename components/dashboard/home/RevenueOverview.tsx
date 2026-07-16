import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Minus,
} from "lucide-react";
import type { DashboardRevenueData } from "@/lib/dashboard/dashboard-types";
import styles from "./RevenueOverview.module.css";

type RevenueOverviewProps = {
  revenue: DashboardRevenueData;
};

const chartWidth = 540;
const chartHeight = 176;
const chartTop = 12;
const chartBottom = 158;

const currencyFormatter =
  new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  });

const compactFormatter =
  new Intl.NumberFormat("sv-SE", {
    notation: "compact",
    maximumFractionDigits: 0,
  });

const dateFormatter =
  new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Stockholm",
  });

function getScaleMaximum(
  maximumValue: number
) {
  if (maximumValue <= 0) {
    return 100000;
  }

  const magnitude = Math.pow(
    10,
    Math.floor(
      Math.log10(maximumValue)
    )
  );

  const normalized =
    maximumValue / magnitude;

  const scale =
    normalized <= 1
      ? 1
      : normalized <= 2
        ? 2
        : normalized <= 5
          ? 5
          : 10;

  return scale * magnitude;
}

export default function RevenueOverview({
  revenue,
}: RevenueOverviewProps) {
  const points =
    revenue.points.length > 0
      ? revenue.points
      : [
          {
            date: new Date()
              .toISOString()
              .slice(0, 10),
            value: 0,
          },
        ];

  const maximumValue = getScaleMaximum(
    Math.max(
      ...points.map(
        (point) => point.value
      )
    )
  );

  const usableWidth = chartWidth - 12;
  const chartRange =
    chartBottom - chartTop;

  const coordinates = points.map(
    (point, index) => {
      const x =
        points.length === 1
          ? chartWidth / 2
          : 6 +
            (index /
              (points.length - 1)) *
              usableWidth;

      const y =
        chartBottom -
        (point.value / maximumValue) *
          chartRange;

      return {
        ...point,
        x,
        y,
      };
    }
  );

  const polylinePoints = coordinates
    .map(
      (point) =>
        `${point.x},${point.y}`
    )
    .join(" ");

  const areaPath = [
    `M ${coordinates[0].x} ${chartBottom}`,
    ...coordinates.map(
      (point) =>
        `L ${point.x} ${point.y}`
    ),
    `L ${
      coordinates[
        coordinates.length - 1
      ].x
    } ${chartBottom}`,
    "Z",
  ].join(" ");

  const highlightedPoint =
    coordinates[
      coordinates.length - 1
    ];

  const trendDirection =
    revenue.change_percent > 0
      ? "positive"
      : revenue.change_percent < 0
        ? "negative"
        : "neutral";

  const TrendIcon =
    trendDirection === "positive"
      ? ArrowUp
      : trendDirection === "negative"
        ? ArrowDown
        : Minus;

  const labelIndexes = Array.from(
    new Set([
      0,
      Math.floor(
        (points.length - 1) * 0.25
      ),
      Math.floor(
        (points.length - 1) * 0.5
      ),
      Math.floor(
        (points.length - 1) * 0.75
      ),
      points.length - 1,
    ])
  );

  const yAxisValues = [
    maximumValue,
    maximumValue * 0.66,
    maximumValue * 0.33,
    0,
  ];

  const tooltipLeft = Math.min(
    88,
    Math.max(
      12,
      (highlightedPoint.x /
        chartWidth) *
        100
    )
  );

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <h2>Intäktsöversikt</h2>

        <button
          type="button"
          className={styles.periodButton}
        >
          <span>{revenue.period}</span>
          <ChevronDown
            size={16}
            strokeWidth={1.7}
          />
        </button>
      </header>

      <div className={styles.summary}>
        <strong>
          {currencyFormatter.format(
            revenue.total
          )}
        </strong>

        <div className={styles.trend}>
          <span
            className={
              styles[trendDirection]
            }
          >
            <TrendIcon
              size={13}
              strokeWidth={2}
            />

            {Math.abs(
              revenue.change_percent
            ).toLocaleString("sv-SE")}
            %
          </span>

          <small>
            jämfört med förra månaden
          </small>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <div
          className={styles.yAxis}
          aria-hidden="true"
        >
          {yAxisValues.map(
            (value, index) => (
              <span key={index}>
                {compactFormatter.format(
                  value
                )}
              </span>
            )
          )}
        </div>

        <div className={styles.chart}>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            role="img"
            aria-label="Intäkter denna månad"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="revenueArea"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#59dcc7"
                  stopOpacity="0.3"
                />

                <stop
                  offset="100%"
                  stopColor="#59dcc7"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {[30, 72, 114, 156].map(
              (y) => (
                <line
                  key={y}
                  x1="0"
                  x2={chartWidth}
                  y1={y}
                  y2={y}
                  className={
                    styles.gridLine
                  }
                />
              )
            )}

            <path
              d={areaPath}
              fill="url(#revenueArea)"
            />

            <polyline
              points={polylinePoints}
              className={styles.line}
            />

            {coordinates.map(
              (point) => (
                <circle
                  key={point.date}
                  cx={point.x}
                  cy={point.y}
                  r="2.1"
                  className={
                    styles.point
                  }
                />
              )
            )}

            <circle
              cx={highlightedPoint.x}
              cy={highlightedPoint.y}
              r="5"
              className={
                styles.highlightPoint
              }
            />
          </svg>

          <div
            className={styles.tooltip}
            style={{
              left: `${tooltipLeft}%`,
              top: `${
                (highlightedPoint.y /
                  chartHeight) *
                100
              }%`,
            }}
          >
            <strong>
              {currencyFormatter.format(
                highlightedPoint.value
              )}
            </strong>

            <span>
              {dateFormatter.format(
                new Date(
                  `${highlightedPoint.date}T12:00:00`
                )
              )}
            </span>
          </div>

          <div
            className={styles.xAxis}
            aria-hidden="true"
          >
            {labelIndexes.map((index) => (
              <span key={index}>
                {dateFormatter.format(
                  new Date(
                    `${points[index].date}T12:00:00`
                  )
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
