"""
Business Service: Manages business context attributes for files and modules.
Provides simulation helpers, domain tagging, and CRUD endpoints.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from backend.database.models import BusinessContext, SourceFile
from backend.schemas.business_context import BusinessContextCreate, BusinessContextUpdate


class BusinessService:
    @staticmethod
    def get_or_create_business_context(db: Session, ctx_in: BusinessContextCreate) -> BusinessContext:
        ctx = db.query(BusinessContext).filter(BusinessContext.file_id == ctx_in.file_id).first()
        if not ctx:
            ctx = BusinessContext(
                file_id=ctx_in.file_id,
                business_criticality=ctx_in.business_criticality,
                customer_impact=ctx_in.customer_impact,
                module_criticality=ctx_in.module_criticality,
                release_proximity=ctx_in.release_proximity,
                sprint_urgency=ctx_in.sprint_urgency,
                maintenance_cost=ctx_in.maintenance_cost,
                estimated_remediation_effort=ctx_in.estimated_remediation_effort,
                domain_tag=ctx_in.domain_tag,
            )
            db.add(ctx)
        else:
            ctx.business_criticality = ctx_in.business_criticality
            ctx.customer_impact = ctx_in.customer_impact
            ctx.module_criticality = ctx_in.module_criticality
            ctx.release_proximity = ctx_in.release_proximity
            ctx.sprint_urgency = ctx_in.sprint_urgency
            ctx.maintenance_cost = ctx_in.maintenance_cost
            ctx.estimated_remediation_effort = ctx_in.estimated_remediation_effort
            ctx.domain_tag = ctx_in.domain_tag

        db.commit()
        db.refresh(ctx)
        return ctx

    @staticmethod
    def update_business_context(db: Session, file_id: int, update_data: BusinessContextUpdate) -> Optional[BusinessContext]:
        ctx = db.query(BusinessContext).filter(BusinessContext.file_id == file_id).first()
        if not ctx:
            # Check if file exists to create a new one
            file_obj = db.query(SourceFile).filter(SourceFile.id == file_id).first()
            if not file_obj:
                return None
            ctx = BusinessContext(file_id=file_id)
            db.add(ctx)

        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(ctx, field, value)

        db.commit()
        db.refresh(ctx)
        return ctx

    @staticmethod
    def get_business_context_by_file_id(db: Session, file_id: int) -> Optional[BusinessContext]:
        return db.query(BusinessContext).filter(BusinessContext.file_id == file_id).first()

    @staticmethod
    def get_all_business_contexts(db: Session) -> List[BusinessContext]:
        return db.query(BusinessContext).all()
