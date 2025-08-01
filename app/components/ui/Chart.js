"use client"

import React, { useContext, useMemo, useEffect, useState, useId, forwardRef, createContext } from "react"
import * as RechartsPrimitive from "recharts"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" }

const ChartContext = createContext(null)

function useChart() {
  const context = useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

const ChartContainer = forwardRef(({ id, className = "", children, config, ...props }, ref) => {
  const uniqueId = useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={
          "flex aspect-video justify-center text-xs " +
          " [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground " +
          " [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 " +
          " [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border " +
          " [&_.recharts-dot[stroke='#fff']]:stroke-transparent " +
          " [&_.recharts-layer]:outline-none " +
          " [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border " +
          " [&_.recharts-radial-bar-background-sector]:fill-muted " +
          " [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted " +
          " [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border " +
          " [&_.recharts-sector[stroke='#fff']]:stroke-transparent " +
          " [&_.recharts-sector]:outline-none " +
          " [&_.recharts-surface]:outline-none " +
          className
        }
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).filter(([_, conf]) => conf.theme || conf.color)

  if (!colorConfig.length) return null

  const styleString = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      return `${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme] || itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .filter(Boolean)
  .join("\n")}
}`
    })
    .join("\n")

  return <style dangerouslySetInnerHTML={{ __html: styleString }} />
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = forwardRef(
  (
    {
      active,
      payload,
      className = "",
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName = "",
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = useMemo(() => {
      if (hideLabel || !payload?.length) return null

      const [item] = payload
      const key = labelKey || item.dataKey || item.name || "value"
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? (config[label]?.label || label)
          : itemConfig?.label

      if (labelFormatter) {
        return <div className={"font-medium " + labelClassName}>{labelFormatter(value, payload)}</div>
      }

      if (!value) return null
      return <div className={"font-medium " + labelClassName}>{value}</div>
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

    if (!active || !payload?.length) return null

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl " +
          className
        }
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = nameKey || item.name || item.dataKey || "value"
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={
                  "flex w-full flex-wrap gap-2 " +
                  (indicator === "dot" ? "items-center " : "items-stretch ") +
                  "[&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"
                }
              >
                {formatter && item.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={
                            "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg] " +
                            (indicator === "dot"
                              ? "h-2.5 w-2.5"
                              : indicator === "line"
                              ? "w-1"
                              : indicator === "dashed"
                              ? "w-0 border-[1.5px] border-dashed bg-transparent my-0.5"
                              : "")
                          }
                          style={{
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          }}
                        />
                      )
                    )}
                    <div className={"flex flex-1 justify-between leading-none " + (nestLabel ? "items-end" : "items-center")}>
                      <div className="grid gap-1.5">{nestLabel ? tooltipLabel : null}<span className="text-muted-foreground">{itemConfig?.label || item.name}</span></div>
                      {item.value !== undefined && (
                        <span className="font-mono font-medium tabular-nums text-foreground">{item.value.toLocaleString()}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = forwardRef(({ className = "", hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart()

  if (!payload?.length) return null

  return (
    <div
      ref={ref}
      className={
        "flex items-center justify-center gap-4 " + (verticalAlign === "top" ? "pb-3" : "pt-3") + " " + className
      }
    >
      {payload.map((item) => {
        const key = nameKey || item.dataKey || "value"
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={item.value}
            className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegend"

function getPayloadConfigFromPayload(config, payload, key) {
  if (typeof payload !== "object" || payload === null) return undefined

  const payloadPayload =
    payload.payload && typeof payload.payload === "object" ? payload.payload : undefined

  let configLabelKey = key

  if (key in payload && typeof payload[key] === "string") {
    configLabelKey = payload[key]
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key] === "string"
  ) {
    configLabelKey = payloadPayload[key]
  }

  return config[configLabelKey] || config[key]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
