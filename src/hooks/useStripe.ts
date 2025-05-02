import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { IApiSuccessResponse } from "@/types/api.types"
import type { ConnectAccountResponse,AccountLinkResponse,AccountStatusResponse,PaymentWithEmailResponse,CreatePaymentWithEmailRequest,DashboardLinkResponse,SkipStripeSetupResponse } from "@/types/Stripe.interface";



export const useStripeConnect = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
        mutationFn: async () => api.post<IApiSuccessResponse<ConnectAccountResponse>>("/stripe/connect"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
            toast({
                title: "Compte créé avec succès",
                description: "Votre compte Stripe a été créé avec succès",
            });
        },
    });
};

export const useStripeAccountLink = (
    returnUrl: string,
    refreshUrl: string,
) => {

  return useMutation({
    mutationFn: async () => api.post<IApiSuccessResponse<AccountLinkResponse>>("/stripe/account-link", {

      returnUrl: returnUrl,
      refreshUrl: refreshUrl,
    }),
    onSuccess: (data) => {
        window.location.href = data.data?.url || "";
    },
  });
};

export const useStripeAccountStatus = (accountId: string) => {

  return useQuery({
    queryKey: ["stripe-account-status", accountId],
    queryFn: async () => api.get<IApiSuccessResponse<AccountStatusResponse>>(`/stripe/account-status/${accountId}`),
  });
};

export const useStripeSendPaymentIntent = () => {
    const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePaymentWithEmailRequest) => api.post<IApiSuccessResponse<PaymentWithEmailResponse>>("/stripe/create-payment-with-email", {
      amount: data.amount,
      description: data.description,
      invoiceId: data.invoiceId,
      successUrl: process.env.NEXT_PUBLIC_CLIENT_URL + "/dashboard",
      cancelUrl: process.env.NEXT_PUBLIC_CLIENT_URL + "/dashboard",

    }),
    onSuccess: () => {
        toast({
            title: "Demande de paiement envoyée",
            description: "Votre demande de paiement a été envoyée avec succès",
        });
    },
  });
};

export const useStripeCreateDashboardLink = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => api.get<IApiSuccessResponse<DashboardLinkResponse>>("/stripe/dashboard-link"),
    onSuccess: (data) => {
        window.location.href = data.data?.url || "";
    },
    onError: () => {
      toast({
        title: "Erreur lors de la création du lien",
        description: "Veuillez réessayer",
      });
    },
  });
};

export const useStripeSkippingOnboarding = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: async () => api.post<IApiSuccessResponse<SkipStripeSetupResponse>>("/stripe/skip-setup"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: "Onboarding passé",
        description: "Vous avez passé l'onboarding avec succès",
      });
    },
  });
};
