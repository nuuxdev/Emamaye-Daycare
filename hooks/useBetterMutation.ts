import { useMutation } from "convex/react";
import { FunctionReference, OptionalRestArgs } from "convex/server";
import { ConvexError } from "convex/values";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

export default function useBetterMutation<
  Mutation extends FunctionReference<"mutation">,
>(
  mutationFn: Mutation,
): {
  mutate: (...args: OptionalRestArgs<Mutation>) => Promise<void>;
  isPending: boolean | string;
  setIsPending: Dispatch<SetStateAction<boolean | string>>;
} {
  const [isPending, setIsPending] = useState<boolean | string>(false);
  const doMutation = useMutation(mutationFn);
  const mutate = async (...args: OptionalRestArgs<Mutation>) => {
    try {
      const response = await doMutation(...args);
      toast.success(response);
    } catch (error) {
      if (error instanceof ConvexError) toast.error(error.message);
      else toast.error("Oops! something went wrong");
    }
  };
  return { mutate, isPending, setIsPending };
}
