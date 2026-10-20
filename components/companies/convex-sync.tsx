"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { COMPANIES, type Company, type Tag } from "@/data/companies";
import { setBackend } from "@/lib/backend";
import {
  clearLegacyData,
  legacyData,
  useCompaniesStore,
} from "@/stores/companies-store";
import { toast } from "@/stores/toast-store";

function toStored(company: Company) {
  const { id, ...rest } = company;
  return { ...rest, slug: id, tags: rest.tags as string[] };
}

export default function ConvexSync() {
  const companies = useQuery(api.companies.list);
  const notes = useQuery(api.activity.notes);
  const changes = useQuery(api.activity.changes);
  const viewer = useQuery(api.users.me);
  const bootstrap = useMutation(api.companies.bootstrap);
  const bootstrapping = useRef(false);
  const bootstrapped = useRef(false);
  const serverCompanies = useRef<Company[] | null>(null);

  const add = useMutation(api.companies.add);
  const remove = useMutation(api.companies.remove);
  const restore = useMutation(api.companies.restore);
  const update = useMutation(api.companies.update);
  const revert = useMutation(api.companies.revert);
  const assignOwner = useMutation(api.companies.assignOwner);
  const restoreOwners = useMutation(api.companies.restoreOwners);
  const addNote = useMutation(api.activity.addNote);
  const removeNote = useMutation(api.activity.removeNote);
  const restoreNote = useMutation(api.activity.restoreNote);

  useEffect(() => {
    setBackend({
      add: (company) => add({ company: toStored(company) }),
      remove: (slugs) => remove({ slugs }),
      restore: (stored) => restore({ companies: stored }),
      update: (slug, patch, texts) => update({ slug, patch, changes: texts }),
      revert: ({ slug, previous, changeIds }) =>
        revert({
          slug,
          previous,
          changeIds: changeIds as Id<"changes">[],
        }),
      assignOwner: (slugs, owner) => assignOwner({ slugs, owner }),
      restoreOwners: ({ previous, changeIds }) =>
        restoreOwners({ previous, changeIds: changeIds as Id<"changes">[] }),
      addNote: (companySlug, body) => addNote({ companySlug, body }),
      removeNote: (id) => removeNote({ id: id as Id<"notes"> }),
      restoreNote: (note) =>
        restoreNote({
          note: { ...note, authorId: note.authorId as Id<"users"> | undefined },
        }),
      onError: (error) => {
        toast(
          error instanceof ConvexError
            ? `Couldn't save: ${String(error.data)}`
            : "Couldn't save the change. It was not stored.",
        );
        if (serverCompanies.current) {
          useCompaniesStore.setState({ companies: serverCompanies.current });
        }
      },
    });
    return () => setBackend(null);
  }, [
    add,
    remove,
    restore,
    update,
    revert,
    assignOwner,
    restoreOwners,
    addNote,
    removeNote,
    restoreNote,
  ]);

  useEffect(() => {
    if (companies === undefined) return;
    if (companies.length === 0 && !bootstrapped.current) {
      if (bootstrapping.current) return;
      bootstrapping.current = true;
      const source = legacyData ?? {
        companies: COMPANIES,
        notes: [],
        changes: [],
      };
      bootstrap({
        companies: source.companies.map(toStored),
        notes: source.notes.map((note) => ({
          companySlug: note.companyId,
          body: note.body,
          author: note.author,
          at: note.at,
        })),
        changes: source.changes.map((change) => ({
          companySlug: change.companyId,
          text: change.text,
          author: change.author,
          at: change.at,
        })),
      })
        .then((imported) => {
          if (imported && legacyData) {
            toast("Moved the companies saved in this browser to the server");
          }
          clearLegacyData();
          bootstrapped.current = true;
          if (!imported) applyCompanies([]);
        })
        .catch(() => {
          bootstrapping.current = false;
        });
      return;
    }
    bootstrapped.current = true;
    clearLegacyData();
    applyCompanies(
      companies.map((company) => ({ ...company, tags: company.tags as Tag[] })),
    );

    function applyCompanies(next: Company[]) {
      serverCompanies.current = next;
      useCompaniesStore.setState((state) => ({
        companies: next,
        loaded: true,
        selectedIds: state.selectedIds.filter((id) =>
          next.some((company) => company.id === id),
        ),
      }));
    }
  }, [companies, bootstrap]);

  useEffect(() => {
    if (notes) useCompaniesStore.setState({ notes });
  }, [notes]);

  useEffect(() => {
    if (changes) useCompaniesStore.setState({ changes });
  }, [changes]);

  useEffect(() => {
    useCompaniesStore.setState({ viewer: viewer ?? null });
  }, [viewer]);

  return null;
}
