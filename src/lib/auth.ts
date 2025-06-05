import { useSession } from "next-auth/react"

export const getUser = useSession() as () => {
  data: {
    user: {
      id: string
      name: string
      email: string
      image: string
    }
  } | null
}