drop extension if exists "pg_net";


  create table "public"."questionarios" (
    "id" uuid not null default gen_random_uuid(),
    "nome" text not null,
    "assinatura_data" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "pdf_url" text,
    "cpf" text,
    "data_nascimento" date,
    "tipo_exame" text,
    "data_exame" date,
    "status" text default 'aguardando_revisao'::text,
    "respostas_completas" jsonb not null,
    "assinatura_tecnico" text,
    "data_finalizacao" timestamp with time zone
      );


alter table "public"."questionarios" enable row level security;

CREATE INDEX idx_questionarios_respostas ON public.questionarios USING gin (respostas_completas);

CREATE INDEX idx_questionarios_status ON public.questionarios USING btree (status);

CREATE UNIQUE INDEX questionarios_pkey ON public.questionarios USING btree (id);

alter table "public"."questionarios" add constraint "questionarios_pkey" PRIMARY KEY using index "questionarios_pkey";

alter table "public"."questionarios" add constraint "status_check" CHECK ((status = ANY (ARRAY['aguardando_revisao'::text, 'finalizado'::text, 'cancelado'::text]))) not valid;

alter table "public"."questionarios" validate constraint "status_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."questionarios" to "anon";

grant insert on table "public"."questionarios" to "anon";

grant references on table "public"."questionarios" to "anon";

grant select on table "public"."questionarios" to "anon";

grant trigger on table "public"."questionarios" to "anon";

grant truncate on table "public"."questionarios" to "anon";

grant update on table "public"."questionarios" to "anon";

grant delete on table "public"."questionarios" to "authenticated";

grant insert on table "public"."questionarios" to "authenticated";

grant references on table "public"."questionarios" to "authenticated";

grant select on table "public"."questionarios" to "authenticated";

grant trigger on table "public"."questionarios" to "authenticated";

grant truncate on table "public"."questionarios" to "authenticated";

grant update on table "public"."questionarios" to "authenticated";

grant delete on table "public"."questionarios" to "service_role";

grant insert on table "public"."questionarios" to "service_role";

grant references on table "public"."questionarios" to "service_role";

grant select on table "public"."questionarios" to "service_role";

grant trigger on table "public"."questionarios" to "service_role";

grant truncate on table "public"."questionarios" to "service_role";

grant update on table "public"."questionarios" to "service_role";


  create policy "Anyone can insert questionnaires"
  on "public"."questionarios"
  as permissive
  for insert
  to public
with check (true);



  create policy "Anyone can read questionnaires"
  on "public"."questionarios"
  as permissive
  for select
  to public
using (true);



  create policy "Anyone can update pdf_url"
  on "public"."questionarios"
  as permissive
  for update
  to public
using (true)
with check (true);


CREATE TRIGGER update_questionarios_updated_at BEFORE UPDATE ON public.questionarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


  create policy "Anyone can read PDFs"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'questionarios-pdfs'::text));



  create policy "Service can insert PDFs"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'questionarios-pdfs'::text));



