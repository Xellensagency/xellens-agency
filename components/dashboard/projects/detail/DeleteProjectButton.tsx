"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  LoaderCircle,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  deleteProjectAction,
} from "@/app/dashboard/projekt/[id]/actions";

import styles from "./ProjectDetail.module.css";

type DeleteProjectButtonProps = {
  projectId: string;
  projectTitle: string;
};

export default function DeleteProjectButton({
  projectId,
  projectTitle,
}: DeleteProjectButtonProps) {
  const router =
    useRouter();

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  function deleteProject() {
    const confirmed =
      window.confirm(
        `Vill du permanent ta bort projektet "${projectTitle}"?\n\nDetta går inte att ångra.`
      );

    if (!confirmed) {
      return;
    }

    setError("");

    startTransition(
      async () => {
        const result =
          await deleteProjectAction(
            projectId
          );

        if (!result.ok) {
          setError(
            result.error ||
            "Projektet kunde inte tas bort."
          );

          return;
        }

        router.push(
          "/dashboard/projekt"
        );

        router.refresh();
      }
    );
  }

  return (
    <div
      className={
        styles.deleteArea
      }
    >
      {error && (
        <div
          className={
            styles.deleteError
          }
        >
          <TriangleAlert
            size={16}
          />

          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        className={
          styles.deleteButton
        }
        onClick={
          deleteProject
        }
        disabled={
          isPending
        }
      >
        {isPending ? (
          <LoaderCircle
            size={17}
            className={
              styles.spinner
            }
          />
        ) : (
          <Trash2
            size={17}
          />
        )}

        {isPending
          ? "Tar bort..."
          : "Ta bort projekt"}
      </button>
    </div>
  );
}
