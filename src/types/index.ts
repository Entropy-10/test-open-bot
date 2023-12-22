import type env from '@env'
import type { ColorResolvable } from 'discord.js'

export enum Environment {
  development = 'development',
  production = 'production'
}

export interface StatusInfo {
  color: ColorResolvable
  emoji: string
}

export type EnvEnum = Record<string, keyof typeof env>

// ------------------- Uptime Types ------------------- \\

export interface UptimeDataResponse<T> {
  data: T
}

export type Status = 'operational' | 'downtime' | 'degraded' | 'maintenance'

export interface StatusPage {
  id: string
  type: 'status_page'
  attributes: {
    company_name: string
    company_url: string
    contact_url: string | null
    logo_url: string | null
    timezone: string
    subdomain: string
    custom_domain: string | null
    custom_css: string | null
    google_analytics_id: string | null
    min_incident_length: number
    announcement: string | null
    announcement_embed_visible: boolean
    announcement_embed_css: string
    announcement_embed_link: string
    automatic_reports: boolean
    subscribable: boolean
    hide_from_search_engines: boolean
    password_enabled: boolean
    history: number
    aggregate_state: Status
    design: 'v1' | 'v2'
    theme: 'light' | 'dark'
    layout: 'vertical' | 'horizontal'
    created_at: string
    updated_at: string
  }
}

export interface Resource {
  id: string
  type: string
  attributes: {
    resource_id: number
    resource_type:
      | 'Monitor'
      | 'Heartbeat'
      | 'WebhookIntegration'
      | 'EmailIntegration'
    public_name: string
    explanation: string
    widget_type: 'history' | 'plain' | 'response_times'
    position: number
    availability: number
    status_history: {
      day: string
      status: Status | 'not_monitored'
      downtime_duration: number
    }[]
  }
}

export interface StatusReport {
  id: string
  type: string
  attributes: {
    title: string
    report_type: 'manual' | 'maintenance'
    starts_at: string
    ends_at: string | null
    status_page_id: number
    affected_resources: {
      status_page_resource_id: string
      status: Status
    }[]
    aggregate_state: 'Operational' | 'Degraded' | 'Downtime'
  }
  relationships: {
    status_updates: {
      data: {
        id: string
        type: string
      }[]
    }
  }
}
