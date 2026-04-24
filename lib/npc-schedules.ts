import type { AreaId } from "./game-state"

export type TimeOfDay = "morning" | "afternoon" | "evening"
export type NPCActivity = "idle" | "walking" | "working" | "chatting" | "resting"

export interface ScheduleEntry {
  time: TimeOfDay
  area: AreaId
  position: { x: number; y: number }
  activity: NPCActivity
  activityLabel: string // Spanish label shown above NPC
}

export interface NPCRuntimeState {
  currentArea: AreaId
  position: { x: number; y: number }
  activity: NPCActivity
  activityLabel: string
  path: { x: number; y: number }[]
  facingDirection: "left" | "right"
}

// Schedules for NPCs that move around during the day.
// NPCs not listed here stay at their static profile positions.
export const NPC_SCHEDULES: Record<string, ScheduleEntry[]> = {
  // Rosa → inn (morning) → garden to visit Abuela (afternoon) → inn (evening)
  innkeeper: [
    { time: "morning", area: "inn", position: { x: 7, y: 3 }, activity: "working", activityLabel: "Cocinando" },
    { time: "afternoon", area: "garden", position: { x: 6, y: 5 }, activity: "chatting", activityLabel: "Visitando" },
    { time: "evening", area: "inn", position: { x: 7, y: 3 }, activity: "working", activityLabel: "Limpiando" },
  ],

  // Pedro → fish_market (morning) → beach to fish (afternoon) → town_square (evening)
  fishmonger: [
    { time: "morning", area: "fish_market", position: { x: 4, y: 4 }, activity: "working", activityLabel: "Vendiendo" },
    { time: "afternoon", area: "beach", position: { x: 7, y: 4 }, activity: "working", activityLabel: "Pescando" },
    { time: "evening", area: "town_square", position: { x: 4, y: 7 }, activity: "idle", activityLabel: "Descansando" },
  ],

  // Lola → fruit_stand (morning) → town_square (afternoon) → fruit_stand (evening)
  fruit_seller: [
    { time: "morning", area: "fruit_stand", position: { x: 6, y: 3 }, activity: "working", activityLabel: "Vendiendo" },
    { time: "afternoon", area: "town_square", position: { x: 9, y: 7 }, activity: "idle", activityLabel: "Paseando" },
    { time: "evening", area: "fruit_stand", position: { x: 6, y: 3 }, activity: "resting", activityLabel: "Cerrando" },
  ],

  // El Filosofo → bakery (morning) → shrine to meditate (afternoon) → bakery (evening)
  baker: [
    { time: "morning", area: "bakery", position: { x: 5, y: 4 }, activity: "working", activityLabel: "Horneando" },
    { time: "afternoon", area: "shrine", position: { x: 5, y: 5 }, activity: "resting", activityLabel: "Meditando" },
    { time: "evening", area: "bakery", position: { x: 5, y: 4 }, activity: "working", activityLabel: "Horneando" },
  ],

  // Don Verso → hot_spring (morning) → fruit_stand to see Lola (afternoon) → hot_spring (evening)
  hotspring_poet: [
    { time: "morning", area: "hot_spring", position: { x: 8, y: 6 }, activity: "resting", activityLabel: "Escribiendo" },
    { time: "afternoon", area: "fruit_stand", position: { x: 8, y: 4 }, activity: "chatting", activityLabel: "Recitando" },
    { time: "evening", area: "hot_spring", position: { x: 8, y: 6 }, activity: "resting", activityLabel: "Sonando" },
  ],

  // Mysterious Cat → town_square → forest → farm (moves unpredictably)
  mysterious_cat: [
    { time: "morning", area: "town_square", position: { x: 10, y: 9 }, activity: "idle", activityLabel: "..." },
    { time: "afternoon", area: "forest", position: { x: 8, y: 5 }, activity: "idle", activityLabel: "..." },
    { time: "evening", area: "farm", position: { x: 10, y: 6 }, activity: "idle", activityLabel: "..." },
  ],

  // Abuela Nube → garden all day, different spots
  gardener: [
    { time: "morning", area: "garden", position: { x: 4, y: 4 }, activity: "working", activityLabel: "Regando" },
    { time: "afternoon", area: "garden", position: { x: 7, y: 5 }, activity: "resting", activityLabel: "Descansando" },
    { time: "evening", area: "garden", position: { x: 9, y: 5 }, activity: "working", activityLabel: "Podando" },
  ],

  // Don Magnifico → town_hall (morning) → town_square speech (afternoon) → town_hall (evening)
  mayor: [
    { time: "morning", area: "town_hall", position: { x: 5, y: 3 }, activity: "working", activityLabel: "Gobernando" },
    { time: "afternoon", area: "town_square", position: { x: 7, y: 4 }, activity: "chatting", activityLabel: "Discurso" },
    { time: "evening", area: "town_hall", position: { x: 5, y: 3 }, activity: "resting", activityLabel: "Cenando" },
  ],

  // Silvestre → forest all day, patrols
  forest_ranger: [
    { time: "morning", area: "forest", position: { x: 5, y: 4 }, activity: "working", activityLabel: "Patrullando" },
    { time: "afternoon", area: "forest", position: { x: 8, y: 8 }, activity: "working", activityLabel: "Observando" },
    { time: "evening", area: "forest", position: { x: 6, y: 6 }, activity: "resting", activityLabel: "Cenando" },
  ],

  // School kids → school (morning/afternoon) → various places (evening)
  school_bully: [
    { time: "morning", area: "school", position: { x: 8, y: 5 }, activity: "idle", activityLabel: "En clase" },
    { time: "afternoon", area: "school", position: { x: 8, y: 6 }, activity: "idle", activityLabel: "En clase" },
    { time: "evening", area: "town_square", position: { x: 10, y: 4 }, activity: "idle", activityLabel: "Jugando" },
  ],
  school_nerd: [
    { time: "morning", area: "school", position: { x: 3, y: 5 }, activity: "working", activityLabel: "Estudiando" },
    { time: "afternoon", area: "school", position: { x: 3, y: 4 }, activity: "working", activityLabel: "Leyendo" },
    { time: "evening", area: "garden", position: { x: 3, y: 3 }, activity: "resting", activityLabel: "Leyendo" },
  ],

  // Profesora Luna → school morning/afternoon, inn evening
  school_teacher: [
    { time: "morning", area: "school", position: { x: 5, y: 3 }, activity: "working", activityLabel: "Ensenando" },
    { time: "afternoon", area: "school", position: { x: 5, y: 3 }, activity: "working", activityLabel: "Ensenando" },
    { time: "evening", area: "inn", position: { x: 5, y: 5 }, activity: "resting", activityLabel: "Cenando" },
  ],

  // Olas → beach all day
  beach_surfer: [
    { time: "morning", area: "beach", position: { x: 4, y: 5 }, activity: "working", activityLabel: "Surfeando" },
    { time: "afternoon", area: "beach", position: { x: 6, y: 6 }, activity: "resting", activityLabel: "Tomando sol" },
    { time: "evening", area: "beach", position: { x: 4, y: 5 }, activity: "idle", activityLabel: "Mirando olas" },
  ],

  // Viejo Mar → beach all day
  beach_fisherman: [
    { time: "morning", area: "beach", position: { x: 8, y: 4 }, activity: "working", activityLabel: "Pescando" },
    { time: "afternoon", area: "beach", position: { x: 10, y: 5 }, activity: "resting", activityLabel: "Contando" },
    { time: "evening", area: "beach", position: { x: 8, y: 4 }, activity: "working", activityLabel: "Pescando" },
  ],

  // Vapor → hot_spring all day
  hotspring_attendant: [
    { time: "morning", area: "hot_spring", position: { x: 5, y: 4 }, activity: "working", activityLabel: "Limpiando" },
    { time: "afternoon", area: "hot_spring", position: { x: 5, y: 8 }, activity: "resting", activityLabel: "Meditando" },
    { time: "evening", area: "hot_spring", position: { x: 5, y: 4 }, activity: "working", activityLabel: "Cerrando" },
  ],

  // Dona Tierra → farm all day
  farm_owner: [
    { time: "morning", area: "farm", position: { x: 5, y: 4 }, activity: "working", activityLabel: "Cosechando" },
    { time: "afternoon", area: "farm", position: { x: 3, y: 5 }, activity: "working", activityLabel: "Sembrando" },
    { time: "evening", area: "farm", position: { x: 5, y: 4 }, activity: "resting", activityLabel: "Descansando" },
  ],

  // Susurro → farm morning, garden afternoon, farm evening
  farm_whisperer: [
    { time: "morning", area: "farm", position: { x: 3, y: 7 }, activity: "working", activityLabel: "Cuidando" },
    { time: "afternoon", area: "garden", position: { x: 11, y: 5 }, activity: "idle", activityLabel: "Paseando" },
    { time: "evening", area: "farm", position: { x: 3, y: 7 }, activity: "resting", activityLabel: "Durmiendo" },
  ],

  // Serena → shrine all day
  shrine_priestess: [
    { time: "morning", area: "shrine", position: { x: 6, y: 3 }, activity: "working", activityLabel: "Rezando" },
    { time: "afternoon", area: "shrine", position: { x: 5, y: 6 }, activity: "resting", activityLabel: "Meditando" },
    { time: "evening", area: "shrine", position: { x: 6, y: 3 }, activity: "working", activityLabel: "Rezando" },
  ],

  // Eco → shrine morning, forest afternoon, shrine evening
  shrine_spirit: [
    { time: "morning", area: "shrine", position: { x: 3, y: 6 }, activity: "idle", activityLabel: "Jugando" },
    { time: "afternoon", area: "forest", position: { x: 7, y: 5 }, activity: "idle", activityLabel: "Explorando" },
    { time: "evening", area: "shrine", position: { x: 3, y: 6 }, activity: "resting", activityLabel: "Durmiendo" },
  ],
}

export function getScheduleForTime(npcId: string, time: TimeOfDay): ScheduleEntry | undefined {
  const schedule = NPC_SCHEDULES[npcId]
  if (!schedule) return undefined
  return schedule.find((s) => s.time === time)
}
