"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowRight,
  BriefcaseBusiness,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";

import {
  createProjectFromAcceptedOfferAction,
} from "@/app/dashboard/offerter/project-actions";

import styles from "./CreateProjectFromOfferButton.module.css";


type Props = {
  offerId: string;
};


export default function CreateProjectFromOfferButton({
  offerId,
}: Props) {

  const router =
    useRouter();


  const [
    isPending,
    startTransition,
  ] =
    useTransition();


  const [
    error,
    setError,
  ] =
    useState("");


  function createProject() {

    if (isPending) {
      return;
    }


    setError("");


    startTransition(
      () => {
        void (
          async () => {

            const result =
              await createProjectFromAcceptedOfferAction(
                offerId
              );


            if (
              !result.ok
            ) {
              setError(
                result.error
              );

              return;
            }


            router.push(
              `/dashboard/projekt/${result.projectId}`
            );

            router.refresh();

          }
        )();
      }
    );
  }


  return (
    <div
      className={
        styles.wrapper
      }
    >
      <button
        type="button"
        onClick={
          createProject
        }
        disabled={
          isPending
        }
        className={
          styles.button
        }
      >
        {isPending ? (
          <>
            <LoaderCircle
              size={16}
              className={
                styles.spinner
              }
            />

            Skapar projekt...
          </>
        ) : (
          <>
            <BriefcaseBusiness
              size={16}
            />

            Skapa projekt från offert

            <ArrowRight
              size={15}
            />
          </>
        )}
      </button>


      {error && (
        <div
          className={
            styles.error
          }
        >
          <TriangleAlert
            size={15}
          />

          <span>
            {error}
          </span>
        </div>
      )}
    </div>
  );
}