output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.app.id
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.app.domain_name
}

output "alb_dns" {
  value = aws_lb.app.dns_name
}

# Add these as CNAME records in Cloudflare (DNS only — NOT proxied)
output "cert_validation_records" {
  description = "Add these CNAME records in Cloudflare to validate ACM certificates"
  value = merge(
    { for v in aws_acm_certificate.alb.domain_validation_options : v.domain_name => {
      name  = v.resource_record_name
      type  = v.resource_record_type
      value = v.resource_record_value
    }},
    { for v in aws_acm_certificate.cdn.domain_validation_options : v.domain_name => {
      name  = v.resource_record_name
      type  = v.resource_record_type
      value = v.resource_record_value
    }}
  )
}
