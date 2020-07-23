#-------------------------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See https://go.microsoft.com/fwlink/?linkid=2090316 for license information.
#-------------------------------------------------------------------------------------------------------------

FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build

FROM build as publish
COPY ./src ./src
WORKDIR /src
RUN dotnet build -c Release -o /app
RUN dotnet publish ${PROJECT_PATH} -c Release -o /app

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-buster-slim AS runtime
WORKDIR /app
EXPOSE 80
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "dotnet-core-api-jwt-bearer.dll"]
