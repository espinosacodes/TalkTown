import PusherClient from "pusher-js"

let pusherInstance: PusherClient | null = null

export function getPusherClient(userId: string): PusherClient {
  if (pusherInstance) return pusherInstance

  pusherInstance = new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_KEY!,
    {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
      auth: {
        headers: { "x-user-id": userId },
      },
    }
  )

  return pusherInstance
}

export function disconnectPusher() {
  if (pusherInstance) {
    pusherInstance.disconnect()
    pusherInstance = null
  }
}
