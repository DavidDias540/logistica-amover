create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create role authenticator nologin;

grant anon to authenticator;
grant authenticated to authenticator;
grant service_role to authenticator;