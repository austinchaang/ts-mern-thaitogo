import { useMutation } from '@tanstack/react-query'
import apiClient from '../apiClient'
import { UserInfo } from '../types/UserInfo'

export const useSigninMutation = () =>
  useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string
      password: string
    }) =>
      (
        await apiClient.post<UserInfo>(`users/signin`, {
          email,
          password,
        })
      ).data,
  })

// export const useSigninMutation = () => useMutation({
// parameter destructuring
//     mutationFn: async ({ email, password }: { email: string, password: string }) => {
//       const response = await apiClient.post<UserInfo>('api/users/signin', { email, password });
//       return response.data;
//     }
//   });

export const useSignupMutation = () =>
  useMutation({
    mutationFn: async ({
      name,
      email,
      password,
    }: {
      name: string
      email: string
      password: string
    }) =>
      (
        await apiClient.post<UserInfo>(`users/signup`, {
          name,
          email,
          password,
        })
      ).data,
  })
